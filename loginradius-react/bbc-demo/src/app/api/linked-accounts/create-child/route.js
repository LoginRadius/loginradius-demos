import { NextResponse } from "next/server";
import { LrError, getAccountByAccessToken } from "../../../../server/loginradius.js";
import {
  ChildAccountError,
  promoteProfileToChildAccount,
} from "../../../../server/linkedAccounts.js";

// Promotes one of the caller's viewing profiles into a standalone child
// account, and links the two identities bidirectionally.
//
// Trust model, same as the rest of /api/linked-accounts: the parent uid comes
// from the caller's own access token, never from the body. The M2M credential
// used for the management calls never leaves the server.
//
// The request body carries a plaintext password. It is never logged, and the
// response is marked no-store so no cache holds the credentials handoff.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bearerFrom(request) {
  const header = request.headers.get("authorization") || "";
  const [scheme, value] = header.split(" ");
  if (!value || scheme.toLowerCase() !== "bearer") return null;
  return value.trim() || null;
}

export async function POST(request) {
  // Every response on this route is no-store: the request carries a plaintext
  // password, and nothing about the exchange should sit in a cache.
  const NO_STORE = { "Cache-Control": "no-store" };

  const accessToken = bearerFrom(request);
  if (!accessToken) {
    return NextResponse.json(
      { error: "Missing bearer access token" },
      { status: 401, headers: NO_STORE },
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Expected a JSON body" },
      { status: 400, headers: NO_STORE },
    );
  }

  try {
    const parent = await getAccountByAccessToken(accessToken);
    const result = await promoteProfileToChildAccount(parent.Uid, payload);

    return NextResponse.json(result, {
      status: 201,
      headers: NO_STORE,
    });
  } catch (err) {
    if (err instanceof ChildAccountError) {
      return NextResponse.json(
        { error: err.message, field: err.field },
        { status: err.status, headers: NO_STORE },
      );
    }
    const status = err instanceof LrError ? err.status : 500;
    if (status >= 500) {
      // Message only — the body would carry the child's password.
      console.error("[create-child] failed:", err.message);
    }
    return NextResponse.json(
      { error: err.message || "Unable to create the child account" },
      { status, headers: NO_STORE },
    );
  }
}
