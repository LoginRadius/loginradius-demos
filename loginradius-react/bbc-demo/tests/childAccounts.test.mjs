// Pure logic for promoting a profile into a standalone child account.
// Run: node tests/childAccounts.test.mjs
import assert from "node:assert/strict";
import {
  ChildAccountError,
  LINK_CAP,
  appendChildLink,
  assertCanPromote,
  buildChildAccountPayload,
  buildChildLinkObject,
  isLinkedChild,
  projectChildAccount,
  validateChildInput,
  validatePassword,
} from "../src/server/childAccounts.js";

const PROFILES = [
  { Id: "prf_A", DisplayName: "Jamie", DateOfBirth: "2016-04-01T00:00:00.000Z", IsMinimumAge: true },
  { Id: "prf_B", DisplayName: "Sam" },
];
const ok = { email: "kid@example.com", password: "hunter2hunter", profileId: "prf_A" };

const throws = (fn, match, label, status) =>
  assert.throws(fn, (e) => {
    assert.ok(e instanceof ChildAccountError, `${label}: wrong type`);
    assert.match(e.message, match, label);
    if (status) assert.equal(e.status, status, `${label}: status`);
    return true;
  }, label);

// ── email ────────────────────────────────────────────────────────────────
{
  const v = validateChildInput({ ...ok, email: "  Parent+Kid@Example.COM " }, { profiles: PROFILES });
  assert.equal(v.email, "parent+kid@example.com", "trimmed, lowercased, + preserved");
  for (const bad of ["", "  ", "nope", "a@b", "a b@c.com", "@example.com"]) {
    throws(() => validateChildInput({ ...ok, email: bad }, { profiles: PROFILES }), /email/i, `email: ${bad || "(empty)"}`);
  }
  console.log("✓ email: sub-addressing kept, lowercased, invalid rejected");
}

// ── password ─────────────────────────────────────────────────────────────
{
  throws(() => validateChildInput({ ...ok, password: "short" }, { profiles: PROFILES }), /at least 8/, "too short");
  throws(() => validateChildInput({ ...ok, password: "x".repeat(129) }, { profiles: PROFILES }), /128 characters or fewer/, "too long");
  throws(
    () => validateChildInput({ ...ok, confirmPassword: "different" }, { profiles: PROFILES }),
    /do not match/, "mismatch",
  );
  const v = validateChildInput({ ...ok, confirmPassword: ok.password }, { profiles: PROFILES });
  assert.equal(v.password, ok.password);
  console.log("✓ password: length bounds and confirmation enforced");
}

// ── the profile must belong to the caller ────────────────────────────────
{
  throws(() => validateChildInput({ ...ok, profileId: "prf_NOPE" }, { profiles: PROFILES }), /not on this account/, "foreign profile");
  throws(() => validateChildInput({ ...ok, profileId: "" }, { profiles: PROFILES }), /Select which profile/, "missing");
  throws(() => validateChildInput(ok, { profiles: [] }), /not on this account/, "no profiles at all");
  const v = validateChildInput(ok, { profiles: PROFILES });
  assert.equal(v.profile.DisplayName, "Jamie", "resolves the record, not just the id");
  console.log("✓ profile selection is validated against the caller's own list");
}

// ── who may promote ──────────────────────────────────────────────────────
{
  throws(() => assertCanPromote({ isChild: true, links: [] }), /Child accounts cannot/, "child blocked", 403);
  const full = Array.from({ length: LINK_CAP }, (_, i) => ({ ReferenceId: `u${i}` }));
  throws(() => assertCanPromote({ isChild: false, links: full }), /maximum allowed/, "cap");
  assert.doesNotThrow(() => assertCanPromote({ isChild: false, links: full.slice(0, -1) }), "cap is inclusive");
  assert.doesNotThrow(() => assertCanPromote({ isChild: false, links: [] }), "unlinked parent may promote");
  console.log(`✓ only parents may promote, capped at ${LINK_CAP} links`);
}

// ── payloads ─────────────────────────────────────────────────────────────
{
  const p = buildChildAccountPayload({ email: "kid@example.com", password: "pw" });
  assert.deepEqual(p.Email, [{ Type: "Primary", Value: "kid@example.com" }]);
  assert.equal(p.CustomFields.AccountType, "child");
  assert.equal(typeof p.CustomFields.AccountType, "string", "CustomFields values must be strings");
  assert.equal(p.IsActive, true);
  assert.equal(p.EmailVerified, true);
  console.log("✓ registration payload matches the manage-account schema");
}

{
  const o = buildChildLinkObject({ parentUid: "P1", profile: PROFILES[0] });
  assert.deepEqual(o.LinkedAccounts, [{ LinkType: "parent", ReferenceId: "P1" }]);
  assert.equal(o.Profiles.length, 1, "profile is copied into the child object");
  assert.equal(o.Profiles[0].Id, "prf_A");
  assert.notEqual(o.Profiles[0], PROFILES[0], "copied, not the same reference");
  assert.deepEqual(buildChildLinkObject({ parentUid: "P1" }).Profiles, [], "no profile ⇒ empty");
  console.log("✓ child link object mirrors the parent and copies the profile");
}

// ── parent's link array ──────────────────────────────────────────────────
{
  const existing = [{ LinkType: "child", ReferenceId: "C1" }];
  const next = appendChildLink(existing, { childUid: "C2", profileId: "prf_A" });
  assert.equal(next.length, 2);
  assert.deepEqual(next[1], { LinkType: "child", ReferenceId: "C2", ProfileId: "prf_A" });
  assert.deepEqual(existing, [{ LinkType: "child", ReferenceId: "C1" }], "input not mutated");
  throws(() => appendChildLink(existing, { childUid: "C1", profileId: "x" }), /already linked/, "duplicate", 409);
  assert.equal(appendChildLink(undefined, { childUid: "C2", profileId: "p" }).length, 1, "absent array tolerated");
  console.log("✓ parent link append: ProfileId recorded, duplicates rejected, no mutation");
}

// ── delegation gate: the whole authorisation model for child admin ───────
{
  const links = [
    { LinkType: "child", ReferenceId: "C1" },
    { LinkType: "parent", ReferenceId: "P9" },
  ];
  assert.equal(isLinkedChild(links, "C1"), true, "own child");
  assert.equal(isLinkedChild(links, "P9"), false, "a parent link is not a child");
  assert.equal(isLinkedChild(links, "SOMEONE_ELSE"), false, "another household");
  assert.equal(isLinkedChild(links, ""), false);
  assert.equal(isLinkedChild(links, undefined), false);
  assert.equal(isLinkedChild([], "C1"), false, "no links at all");
  assert.equal(isLinkedChild(undefined, "C1"), false);
  assert.equal(isLinkedChild([{ LinkType: "CHILD", ReferenceId: "C1" }], "C1"), true, "casing normalised");
  console.log("✓ delegation gate admits only the caller's own children");
}

// ── the projection is an allowlist ───────────────────────────────────────
{
  const raw = {
    Uid: "C1",
    Email: [{ Value: "kid@example.com" }],
    EmailVerified: true,
    IsActive: true,
    CreatedDate: "2026-01-01T00:00:00Z",
    LastLoginDate: "2026-02-02T00:00:00Z",
    CustomFields: { AccountType: "child" },
    // Everything below must NOT survive the projection.
    Password: "SENTINEL_PASSWORD",
    PasswordHash: "SENTINEL_HASH",
    Identities: [{ AccessToken: "SENTINEL_TOKEN" }],
    SecurityQuestions: [{ Answer: "SENTINEL_ANSWER" }],
  };
  const view = projectChildAccount(raw);
  // Pin the exact key set: an allowlist is only an allowlist if adding a
  // field to it is a deliberate, visible change.
  assert.deepEqual(Object.keys(view).sort(), [
    "accountType", "createdDate", "email", "emailVerified", "isActive",
    "isDeleted", "lastLoginDate", "lastPasswordChangeDate", "uid",
  ], "projection exposes exactly these fields");
  const serialised = JSON.stringify(view);
  // Distinctive sentinels: a short probe like "x" would match incidentally
  // (there is an x in "example.com") and prove nothing.
  for (const secret of ["SENTINEL_PASSWORD", "SENTINEL_HASH", "SENTINEL_TOKEN", "SENTINEL_ANSWER"]) {
    assert.equal(serialised.includes(secret), false, `value "${secret}" must not survive`);
  }
  assert.equal(view.email, "kid@example.com");
  assert.equal(view.accountType, "child");
  assert.equal(projectChildAccount({}).uid, null, "missing fields degrade to null");
  assert.equal(projectChildAccount({}).isActive, true, "absent IsActive is not 'inactive'");
  console.log("✓ child projection is an allowlist, leaks no credential material");
}

// ── one password rule, shared by create and admin reset ──────────────────
{
  assert.equal(validatePassword("hunter2hunter"), "hunter2hunter");
  throws(() => validatePassword("short"), /at least 8/, "reset: too short");
  throws(() => validatePassword("x".repeat(129)), /128 characters or fewer/, "reset: too long");
  throws(() => validatePassword("hunter2hunter", "different"), /do not match/, "reset: mismatch");
  assert.equal(validatePassword("hunter2hunter", "hunter2hunter"), "hunter2hunter");
  console.log("✓ password rule shared between creation and admin reset");
}

console.log("\nAll child-account tests passed.");
