// Pure decisions behind the profile gate. No React, no I/O — the three
// scenarios are the whole feature, so they're worth being able to test
// directly rather than only through the rendered page.

/**
 * Which of the three entry states applies.
 *
 *   "loading"   graph not known yet
 *   "error"     graph failed to load — the gate fails open
 *   "add-first" no profiles exist; one must be created to continue
 *   "adopt-one" exactly one profile and nothing selected; take it silently
 *   "choose"    several profiles and nothing selected; ask
 *   "ready"     a profile is already active
 */
export function resolveGateState({ status, profiles, activeProfileId }) {
  if (status === "error") return "error";
  if (status !== "ready") return "loading";
  if (activeProfileId) return "ready";
  const count = Array.isArray(profiles) ? profiles.length : 0;
  if (count === 0) return "add-first";
  if (count === 1) return "adopt-one";
  return "choose";
}

/**
 * Sanitises the ?next= return path.
 *
 * Only a same-origin absolute path is allowed. Without this the gate would
 * be an open redirect: ?next=https://evil.example would bounce a signed-in
 * user off a trusted domain straight after authenticating. Protocol-relative
 * ("//evil.example") is rejected too — the browser treats it as absolute.
 */
export function safeNext(raw, fallback = "/") {
  if (typeof raw !== "string" || raw === "") return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//")) return fallback;
  // A backslash is normalised to "/" by some browsers, so "/\evil.example"
  // can escape the origin as well.
  if (raw.startsWith("/\\")) return fallback;
  return raw;
}
