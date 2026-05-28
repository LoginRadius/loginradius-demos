import { useCallback } from "react";
import { useLoginRadiusSDK } from "@loginradius/loginradius-react-sdk";

// Patterns LoginRadius APIs return when the access token is missing/expired.
// Matching is intentionally loose — the error payload shape varies across
// endpoints (Error / string / { Description } / { Message } / { error: {...} }).
const UNAUTHORIZED_PATTERNS = [
  /access\s+unauthorized/i,
  /valid\s+authorization/i,
  /invalid\s+access\s+token/i,
  /token\s+(has\s+)?expired/i,
  /session\s+(has\s+)?expired/i,
];

// LoginRadius numeric error codes for auth failures.
const UNAUTHORIZED_CODES = new Set([401, 905, 906, 920]);

// Module-level latch — a single unauthorized session typically surfaces from
// several widgets at once; we only want one logout + redirect.
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
  const code = err?.ErrorCode ?? err?.errorCode ?? err?.status ?? err?.statusCode ?? err?.code;
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
      console.warn("Forced ssoLogout failed; redirecting anyway:", err);
    } finally {
      window.location.href = window.location.origin + "/home";
    }
  }, [lrInstance]);

  // Returns true when the error was an auth failure and logout was triggered,
  // so callers can decide whether to also surface their own error UI.
  const handleError = useCallback(
    (err) => {
      if (!isUnauthorized(err)) return false;
      console.warn("Session expired — forcing SSO logout");
      forceLogout();
      return true;
    },
    [forceLogout],
  );

  return { handleError, forceLogout };
}
