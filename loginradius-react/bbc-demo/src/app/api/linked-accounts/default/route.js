import { NextResponse } from "next/server";
import { LrError, getAccountByAccessToken } from "../../../../server/loginradius.js";
import {
  ProfileValidationError,
  setDefaultProfile,
} from "../../../../server/linkedAccounts.js";

// Sets the account's default profile.
//
// Same trust model as the rest of /api/linked-accounts: the uid comes from the
// caller's own access token, and the profile must be on that caller's record.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

function bearerFrom(request) {
  const header = request.headers.get("authorization") || "";
  const [scheme, value] = header.split(" ");
  if (!value || scheme.toLowerCase() !== "bearer") return null;
  return value.trim() || null;
}

export async function PUT(request) {
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
    const account = await getAccountByAccessToken(accessToken);
    const result = await setDefaultProfile(account.Uid, payload?.profileId);
    return NextResponse.json(result, { headers: NO_STORE });
  } catch (err) {
    if (err instanceof ProfileValidationError) {
      return NextResponse.json(
        { error: err.message, field: err.field },
        { status: err.status || 400, headers: NO_STORE },
      );
    }
    const status = err instanceof LrError ? err.status : 500;
    if (status >= 500) console.error("[default-profile] failed:", err.message);
    return NextResponse.json(
      { error: err.message || "Unable to set the default profile" },
      { status, headers: NO_STORE },
    );
  }
}
