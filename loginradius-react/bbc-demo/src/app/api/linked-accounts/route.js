import { NextResponse } from "next/server";
import { LrError, getAccountByAccessToken } from "../../../server/loginradius.js";
import {
  ProfileValidationError,
  addProfile,
  buildAccountGraph,
} from "../../../server/linkedAccounts.js";

// Reads the signed-in user's linked-account graph.
//
// The client sends its own LoginRadius access token; the server exchanges
// that for the caller's identity and only then uses the M2M token to read
// management data. The client never names a uid, so it can't ask for
// someone else's graph, and the M2M credential never leaves the server.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bearerFrom(request) {
  const header = request.headers.get("authorization") || "";
  const [scheme, value] = header.split(" ");
  if (!value || scheme.toLowerCase() !== "bearer") return null;
  return value.trim() || null;
}

export async function GET(request) {
  const accessToken = bearerFrom(request);
  if (!accessToken) {
    return NextResponse.json(
      { error: "Missing bearer access token" },
      { status: 401 },
    );
  }

  try {
    const account = await getAccountByAccessToken(accessToken);
    const graph = await buildAccountGraph(account.Uid);
    return NextResponse.json(graph, {
      // Per-user data behind a bearer token — never cached by a shared proxy.
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    const status = err instanceof LrError ? err.status : 500;
    if (status >= 500) {
      console.error("[linked-accounts] failed:", err.message);
    }
    return NextResponse.json(
      { error: err.message || "Unable to load linked accounts" },
      { status },
    );
  }
}

// Adds a Profile to the signed-in user's link_account object.
//
// Same trust model as GET: the uid comes from the caller's own access token,
// never from the request body, so a client can't write profiles onto someone
// else's identity.
export async function POST(request) {
  const accessToken = bearerFrom(request);
  if (!accessToken) {
    return NextResponse.json(
      { error: "Missing bearer access token" },
      { status: 401 },
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body" }, { status: 400 });
  }

  try {
    const account = await getAccountByAccessToken(accessToken);
    const { profileId, graph } = await addProfile(account.Uid, payload);
    return NextResponse.json(
      { profileId, graph },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    if (err instanceof ProfileValidationError) {
      return NextResponse.json(
        { error: err.message, field: err.field },
        { status: 400 },
      );
    }
    const status = err instanceof LrError ? err.status : 500;
    if (status >= 500) {
      console.error("[linked-accounts] add profile failed:", err.message);
    }
    return NextResponse.json(
      { error: err.message || "Unable to add the profile" },
      { status },
    );
  }
}
