"use client";

import { useCallback } from "react";
import { useLoginRadiusSDK } from "@loginradius/loginradius-react";

// Why this exists: on a B2C tenant nothing renews the PKCE access token. The
// OIDC refresh_token from the code exchange is written to the org snapshot, but
// the React layer's refresh path (pkceLogin.refreshTenant) is gated behind
// isB2BEnabled and never runs here. So the session simply ends when the access
// token expires, and the first widget to call an account API gets a 401.
// Rather than leave half the account page showing stale skeletons, the first
// unauthorized response ends the session cleanly and returns the user home.

const UNAUTHORIZED_PATTERNS = [
  /access\s+unauthorized/i,
  /valid\s+authorization/i,
  /invalid\s+access\s+token/i,
  /token\s+(has\s+)?expired/i,
  /session\s+(has\s+)?expired/i,
];

const UNAUTHORIZED_CODES = new Set([401, 905, 906, 920]);

// Module-level latch: an expired token usually surfaces from several widgets at
// once, and we want exactly one logout + redirect.
let logoutInFlight = false;

function extractMessage(err) {
  if (!err) return "";
  if (typeof err === "string") return err;
  return (
    err.Description ||
    err.description ||
    err.Message ||
    err.message ||
    err.error?.Description ||
    err.error?.Message ||
    err.error?.message ||
    ""
  );
}

function isUnauthorized(err) {
  if (!err) return false;
  const code =
    err?.ErrorCode ?? err?.errorCode ?? err?.status ?? err?.statusCode ?? err?.code;
  if (UNAUTHORIZED_CODES.has(Number(code))) return true;
  const text = extractMessage(err);
  return typeof text === "string" && UNAUTHORIZED_PATTERNS.some((re) => re.test(text));
}

export function useSessionGuard() {
  const { lrInstance } = useLoginRadiusSDK();

  const forceLogout = useCallback(async () => {
    if (logoutInFlight) return;
    logoutInFlight = true;
    try {
      await lrInstance?.controller?.ssoLogout?.();
    } catch (err) {
      console.warn("[BBC] Forced sign out failed; redirecting anyway", err);
    } finally {
      window.location.assign(window.location.origin + "/?signedout=expired");
    }
  }, [lrInstance]);

  // Returns true when the error was an auth failure and sign-out was triggered,
  // so callers can skip rendering their own error UI on top of the redirect.
  const handleError = useCallback(
    (err) => {
      if (!isUnauthorized(err)) return false;
      console.warn("[BBC] Session expired — signing out");
      forceLogout();
      return true;
    },
    [forceLogout],
  );

  return { handleError, forceLogout };
}