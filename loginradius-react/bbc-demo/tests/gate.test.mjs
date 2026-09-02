// The three entry scenarios, plus the ?next= redirect guard.
// Run: node tests/gate.test.mjs
import assert from "node:assert/strict";
import { resolveGateState, safeNext } from "../src/views/profiles/gate.js";

const g = (status, profiles, activeProfileId = null) =>
  resolveGateState({ status, profiles, activeProfileId });

// ── scenario 1: new user, no profiles ────────────────────────────────────
assert.equal(g("ready", []), "add-first");
console.log("✓ scenario 1 — no profiles ⇒ add one first");

// ── scenario 2: one profile, adopted silently ────────────────────────────
assert.equal(g("ready", [{ id: "a" }]), "adopt-one");
assert.equal(g("ready", [{ id: "a" }], "a"), "ready", "already active ⇒ straight through");
console.log("✓ scenario 2 — single profile adopted, then ready");

// ── scenario 3: several profiles, must choose ────────────────────────────
assert.equal(g("ready", [{ id: "a" }, { id: "b" }]), "choose");
assert.equal(g("ready", [{ id: "a" }, { id: "b" }], "b"), "ready", "choice sticks");
console.log("✓ scenario 3 — multiple profiles ⇒ choose, then ready");

// ── the gate must fail open, never trap ──────────────────────────────────
assert.equal(g("error", []), "error", "a failed graph never forces add-first");
assert.equal(g("error", [{ id: "a" }, { id: "b" }]), "error");
assert.equal(g("loading", []), "loading");
assert.equal(g("idle", []), "loading");
assert.equal(g("ready", undefined), "add-first", "missing array treated as empty");
console.log("✓ error and loading states never resolve to a gate decision");

// ── ?next= must not become an open redirect ──────────────────────────────
assert.equal(safeNext("/account"), "/account");
assert.equal(safeNext("/account?section=linked"), "/account?section=linked");
for (const hostile of [
  "https://evil.example",
  "//evil.example",
  "/\\evil.example",
  "http://evil.example/path",
  "javascript:alert(1)",
  "evil.example",
  "",
  null,
  undefined,
  42,
]) {
  assert.equal(safeNext(hostile), "/", `rejected: ${String(hostile)}`);
}
assert.equal(safeNext("/x", "/home"), "/x");
assert.equal(safeNext("https://evil.example", "/home"), "/home", "falls back, not through");
console.log("✓ ?next= only follows same-origin paths");

console.log("\nAll gate tests passed.");
