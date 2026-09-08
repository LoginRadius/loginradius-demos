// Default-profile eligibility, reconciliation and picker ordering.
// Run: node tests/defaultProfile.test.mjs
import assert from "node:assert/strict";
import {
  canBeDefault,
  readLinkObject,
  resolveDefaultProfileId,
  shapeAccountGraph,
  sortProfilesForPicker,
} from "../src/server/shapeAccountGraph.js";

const std = (id, over = {}) => ({ id, displayName: id, isMinimumAge: false, status: "active", ...over });
const kid = (id) => std(id, { isMinimumAge: true });

// ── a kids profile is never eligible ─────────────────────────────────────
{
  assert.equal(canBeDefault(std("a")), true);
  assert.equal(canBeDefault(kid("k")), false, "kids profile blocked");
  assert.equal(canBeDefault(std("d", { status: "deleted" })), false, "deleted blocked");
  assert.equal(canBeDefault(null), false);
  assert.equal(canBeDefault(undefined), false);
  console.log("✓ only a standard, live profile can be the default");
}

// ── the stored id is reconciled against reality ──────────────────────────
{
  const profiles = [std("a"), kid("k")];
  assert.equal(resolveDefaultProfileId("a", profiles), "a", "valid id survives");
  assert.equal(resolveDefaultProfileId("k", profiles), null, "a kids profile is dropped");
  assert.equal(resolveDefaultProfileId("gone", profiles), null, "deleted profile is dropped");
  assert.equal(resolveDefaultProfileId(null, profiles), null);
  assert.equal(resolveDefaultProfileId("a", []), null, "no profiles at all");
  console.log("✓ a dangling or newly-ineligible default resolves to none");
}

// ── the default leads the picker ─────────────────────────────────────────
{
  const profiles = [std("a"), std("b"), kid("k")];
  assert.deepEqual(sortProfilesForPicker(profiles, "b").map((p) => p.id), ["b", "a", "k"]);
  assert.deepEqual(sortProfilesForPicker(profiles, null).map((p) => p.id), ["a", "b", "k"], "no default ⇒ untouched");
  assert.deepEqual(sortProfilesForPicker(profiles, "gone").map((p) => p.id), ["a", "b", "k"], "unknown id ⇒ untouched");
  assert.equal(sortProfilesForPicker(profiles, "b").length, profiles.length, "nothing lost");
  console.log("✓ the default is listed first, without dropping anyone");
}

// ── end to end through the graph ─────────────────────────────────────────
{
  const object = (custom) => ({ data: [{ Id: "rec", CustomObject: custom }] });
  const P = [
    { Id: "p1", DisplayName: "Alex", IsMinimumAge: false, Status: "active" },
    { Id: "p2", DisplayName: "Kid", IsMinimumAge: true, Status: "active" },
  ];

  const g = shapeAccountGraph("u", readLinkObject(object({ Profiles: P, DefaultProfileId: "p1" })), []);
  assert.equal(g.defaultProfileId, "p1");
  assert.equal(g.profiles[0].id, "p1", "default leads");

  const kidDefault = shapeAccountGraph("u", readLinkObject(object({ Profiles: P, DefaultProfileId: "p2" })), []);
  assert.equal(kidDefault.defaultProfileId, null, "a kids profile stored as default is ignored on read");
  assert.equal(kidDefault.profiles.length, 2, "but the profile itself still shows");

  const none = shapeAccountGraph("u", readLinkObject(object({ Profiles: P })), []);
  assert.equal(none.defaultProfileId, null, "absent key ⇒ no default");

  const allKids = shapeAccountGraph("u", readLinkObject(object({ Profiles: [P[1]] })), []);
  assert.equal(allKids.defaultProfileId, null, "an all-kids account simply has no default");

  const empty = shapeAccountGraph("u", readLinkObject(null), []);
  assert.equal(empty.defaultProfileId, null, "no record at all");
  console.log("✓ graph surfaces a reconciled default, ordered first");
}

console.log("\nAll default-profile tests passed.");
