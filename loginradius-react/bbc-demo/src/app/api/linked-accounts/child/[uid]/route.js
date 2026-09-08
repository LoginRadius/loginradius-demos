import { NextResponse } from "next/server";
import { LrError, getAccountByAccessToken } from "../../../../../server/loginradius.js";
import {
  ChildAccountError,
  getChildAccount,
  resetChildPassword,
} from "../../../../../server/linkedAccounts.js";

// Parent-led administration of a linked child account.
//
//   GET  → account telemetry for the dashboard (allowlisted fields only)
//   PUT  → reset the child's password
//
// Both are gated twice over: the caller is resolved from their own access
// token (never from the request), and the target uid must appear in that
// caller's own LinkedAccounts as a child. A parent cannot reach another
// household's account by guessing a uid.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

function bearerFrom(request) {
  const header = request.headers.get("authorization") || "";
  const [scheme, value] = header.split(" ");
  if (!value || scheme.toLowerCase() !== "bearer") return null;
  return value.trim() || null;
}

async function callerFrom(request) {
  const accessToken = bearerFrom(request);
  if (!accessToken) {
    throw new ChildAccountError("Missing bearer access token", 401);
  }
  return getAccountByAccessToken(accessToken);
}

function fail(err, label) {
  if (err instanceof ChildAccountError) {
    return NextResponse.json(
      { error: err.message, field: err.field },
      { status: err.status, headers: NO_STORE },
    );
  }
  const status = err instanceof LrError ? err.status : 500;
  if (status >= 500) {
    // Message only: a reset request body carries a plaintext password.
    console.error(`[child-admin] ${label} failed:`, err.message);
  }
  return NextResponse.json(
    { error: err.message || "Request failed" },
    { status, headers: NO_STORE },
  );
}

export async function GET(request, { params }) {
  try {
    const { uid } = await params;
    const parent = await callerFrom(request);
    const child = await getChildAccount(parent.Uid, uid);
    return NextResponse.json(child, { headers: NO_STORE });
  } catch (err) {
    return fail(err, "GET");
  }
}

export async function PUT(request, { params }) {
  try {
    const { uid } = await params;
    const parent = await callerFrom(request);

    let payload;
    try {
      payload = await request.json();
    } catch {
      throw new ChildAccountError("Expected a JSON body", 400);
    }

    const result = await resetChildPassword(parent.Uid, uid, payload);
    return NextResponse.json(result, { headers: NO_STORE });
  } catch (err) {
    return fail(err, "PUT");
  }
}
