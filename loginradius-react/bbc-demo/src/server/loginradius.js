// Server-only LoginRadius client.
//
// Everything here runs in the Node runtime and holds the M2M client secret.
// It must never be imported from a client component — the `server-only`
// import below turns that mistake into a build error rather than a leaked
// credential in the browser bundle.
import "server-only";
import { LrError, isMissingRecordError } from "./errors.js";

const MANAGE_HOST = (
  process.env.LOGINRADIUS_MANAGE_HOST || "https://api.loginradius.com"
).replace(/\/$/, "");
const HUB_DOMAIN = (process.env.LOGINRADIUS_HUB_DOMAIN || "").replace(
  /^https?:\/\//,
  "",
);
const AUDIENCE =
  process.env.LOGINRADIUS_M2M_AUDIENCE ||
  "https://api.loginradius.com/identity/v2/manage";
const CLIENT_ID = process.env.LOGINRADIUS_M2M_CLIENT_ID;
const CLIENT_SECRET = process.env.LOGINRADIUS_M2M_CLIENT_SECRET;
const API_KEY = process.env.NEXT_PUBLIC_LOGINRADIUS_API_KEY;
const LINK_OBJECT_NAME = process.env.LOGINRADIUS_LINK_OBJECT_NAME || "link_account";

export {
  LrError,
  CUSTOM_OBJECT_RECORD_NOT_EXIST,
  isMissingRecordError,
} from "./errors.js";

export function assertServerConfig() {
  const missing = [
    ["LOGINRADIUS_M2M_CLIENT_ID", CLIENT_ID],
    ["LOGINRADIUS_M2M_CLIENT_SECRET", CLIENT_SECRET],
    ["LOGINRADIUS_HUB_DOMAIN", HUB_DOMAIN],
    ["NEXT_PUBLIC_LOGINRADIUS_API_KEY", API_KEY],
  ]
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    throw new LrError(`Server is not configured: ${missing.join(", ")}`, 500);
  }
}

// ── M2M token ────────────────────────────────────────────────────────────
// One token is reused across requests until shortly before it expires.
// `inFlight` collapses concurrent misses into a single token request so a
// burst of page loads doesn't mint a token each.
let cached = null; // { token, expiresAt }
let inFlight = null;

const EXPIRY_SKEW_MS = 60_000;

async function requestM2MToken() {
  const res = await fetch(`https://${HUB_DOMAIN}/service/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      audience: AUDIENCE,
    }),
    cache: "no-store",
  });

  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.access_token) {
    // Surface the provider's error code but never the request body — it
    // carries the client secret.
    throw new LrError(
      body?.error_description || body?.error || "M2M token request failed",
      502,
      body?.error,
    );
  }

  // `expire_in` comes back as a string of seconds.
  const ttlMs = (parseInt(body.expire_in, 10) || 3600) * 1000;
  return {
    token: body.access_token,
    expiresAt: Date.now() + Math.max(ttlMs - EXPIRY_SKEW_MS, 30_000),
  };
}

export async function getM2MToken({ forceRefresh = false } = {}) {
  assertServerConfig();
  if (!forceRefresh && cached && cached.expiresAt > Date.now()) {
    return cached.token;
  }
  if (!inFlight) {
    inFlight = requestM2MToken()
      .then((next) => {
        cached = next;
        return next.token;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

// ── Management API ───────────────────────────────────────────────────────
// Retries once on 401 with a fresh token: a cached token can expire between
// the staleness check and the call landing.
async function manageFetch(path, { searchParams = {}, ...init } = {}) {
  const url = new URL(`${MANAGE_HOST}${path}`);
  url.searchParams.set("apikey", API_KEY);
  for (const [k, v] of Object.entries(searchParams)) {
    if (v != null) url.searchParams.set(k, v);
  }

  const call = async (token) =>
    fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init.headers || {}),
      },
      cache: "no-store",
    });

  let res = await call(await getM2MToken());
  if (res.status === 401) {
    res = await call(await getM2MToken({ forceRefresh: true }));
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new LrError(
      body?.Description || body?.Message || `LoginRadius returned ${res.status}`,
      res.status === 404 ? 404 : 502,
      body?.ErrorCode,
    );
  }
  return body;
}

/**
 * Resolve the caller's own identity from the access token they present.
 * The uid is never taken from the request body — a client could name any
 * uid and read someone else's account graph.
 */
export async function getAccountByAccessToken(accessToken) {
  if (!accessToken) throw new LrError("Missing access token", 401);

  const url = new URL(`${MANAGE_HOST}/identity/v2/auth/account`);
  url.searchParams.set("apikey", API_KEY);
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.Uid) {
    throw new LrError(
      body?.Description || "Could not verify the signed-in user",
      res.status === 401 || res.status === 403 ? 401 : 502,
      body?.ErrorCode,
    );
  }
  return body;
}

export async function getAccountByUid(uid) {
  return manageFetch(`/identity/v2/manage/account/${encodeURIComponent(uid)}`);
}

export async function getLinkAccountObject(uid) {
  try {
    return await manageFetch(
      `/identity/v2/manage/account/${encodeURIComponent(uid)}/customobject`,
      { searchParams: { objectname: LINK_OBJECT_NAME } },
    );
  } catch (err) {
    // An account with no record yet is the normal starting state — every
    // user has one before their first profile is added. Return the same
    // empty shape a populated response would have, so callers have one path.
    if (isMissingRecordError(err)) {
      return { Count: 0, data: [] };
    }
    throw err;
  }
}

/**
 * Create the record. Used only when the identity has no `link_account`
 * object yet — the body becomes the whole CustomObject.
 * POST /identity/v2/manage/account/{uid}/customobject
 */
export async function createLinkAccountObject(uid, customObject) {
  return manageFetch(
    `/identity/v2/manage/account/${encodeURIComponent(uid)}/customobject`,
    {
      method: "POST",
      searchParams: { objectname: LINK_OBJECT_NAME },
      body: JSON.stringify(customObject),
    },
  );
}

/**
 * Update the record.
 * PUT /identity/v2/manage/account/{uid}/customobject/{objectrecordid}
 *
 * `partialreplace` is an upsert over top-level keys, so sending just
 * `{ Profiles: [...] }` leaves LinkedAccounts untouched even if our read of
 * it was stale. `replace` would swap the entire object and drop any key we
 * didn't send — never what we want for a targeted change.
 *
 * Note the two docs disagree on the casing of this query parameter (the
 * OpenAPI reference says `updateType`, the v2 reference `updatetype`), so
 * both are sent with the same value.
 */
export async function updateLinkAccountObject(uid, objectRecordId, partialObject) {
  return manageFetch(
    `/identity/v2/manage/account/${encodeURIComponent(uid)}/customobject/${encodeURIComponent(objectRecordId)}`,
    {
      method: "PUT",
      searchParams: {
        objectname: LINK_OBJECT_NAME,
        updateType: "partialreplace",
        updatetype: "partialreplace",
      },
      body: JSON.stringify(partialObject),
    },
  );
}

/**
 * Create an identity.
 * POST /identity/v2/manage/account
 *
 * The payload carries a plaintext password. It is never logged here, and
 * manageFetch's error path reports only the provider's message — never the
 * request body.
 */
export async function createAccount(payload) {
  return manageFetch("/identity/v2/manage/account", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Update an identity by uid — used for the parent-led password reset and by
 * the promotion rollback.
 * PUT /identity/v2/manage/account/{uid}
 */
export async function updateAccountByUid(uid, payload) {
  return manageFetch(`/identity/v2/manage/account/${encodeURIComponent(uid)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Delete an identity by uid. Only ever called to clean up an account this
 * request just created — never on an account that pre-existed.
 * DELETE /identity/v2/manage/account/{uid}
 */
export async function deleteAccountByUid(uid) {
  return manageFetch(`/identity/v2/manage/account/${encodeURIComponent(uid)}`, {
    method: "DELETE",
  });
}

export { LINK_OBJECT_NAME };
