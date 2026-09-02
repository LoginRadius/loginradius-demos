// Covers the pure add-a-profile logic: validation, record shape, append rules.
// Run: node tests/profiles.test.mjs
import assert from "node:assert/strict";
import {
  ProfileValidationError,
  appendProfile,
  buildProfileRecord,
  newProfileId,
  validateProfileInput,
} from "../src/server/profiles.js";

const throws = (fn, match, label) => {
  assert.throws(fn, (e) => {
    assert.ok(e instanceof ProfileValidationError, `${label}: wrong error type`);
    assert.match(e.message, match, label);
    assert.equal(e.status, 400);
    return true;
  }, label);
};

// ── validation ───────────────────────────────────────────────────────────
{
  throws(() => validateProfileInput(null), /payload is required/, "null payload");
  throws(() => validateProfileInput({}), /Display name is required/, "no name");
  throws(() => validateProfileInput({ displayName: "   " }), /required/, "blank name");
  throws(
    () => validateProfileInput({ displayName: "x".repeat(51) }),
    /50 characters or fewer/,
    "over-long name",
  );
  throws(
    () => validateProfileInput({ displayName: "A", dateOfBirth: "not-a-date" }),
    /not a valid date/,
    "bad dob",
  );
  throws(
    () => validateProfileInput({ displayName: "A", dateOfBirth: "2999-01-01" }),
    /cannot be in the future/,
    "future dob",
  );
  console.log("✓ validation rejects missing/blank/long names and bad dates");
}

{
  const clean = validateProfileInput({
    displayName: "  Mia  ",
    dateOfBirth: "2016-04-02",
    isMinimumAge: "true",
    allowPersonalisation: true,
    allowMarketingDataTransfer: "false",
  });
  assert.equal(clean.displayName, "Mia", "name is trimmed");
  assert.equal(clean.dateOfBirth, "2016-04-02T00:00:00.000Z");
  assert.equal(clean.isMinimumAge, true, "string 'true' coerces to true");
  assert.equal(
    clean.allowMarketingDataTransfer,
    false,
    "string 'false' must NOT be truthy",
  );
  assert.equal(clean.allowPersonalisation, true);
  console.log("✓ validation trims, parses dates and coerces booleans safely");
}

{
  const clean = validateProfileInput({ displayName: "No DOB" });
  assert.equal(clean.dateOfBirth, null, "dob is optional");
  console.log("✓ date of birth is optional");
}

// ── record shape matches what's already stored ───────────────────────────
{
  const now = new Date("2026-09-01T12:00:00.000Z");
  const rec = buildProfileRecord(validateProfileInput({ displayName: "Mia" }), { now });
  assert.deepEqual(Object.keys(rec).sort(), [
    "AllowMarketingDataTransfer", "AllowPersonalisation", "CreatedAt",
    "DateOfBirth", "DisplayName", "Id", "IsMinimumAge", "Revision",
    "Status", "UpdatedAt", "Verified",
  ], "keys match the existing Profiles[] entries");
  assert.equal(rec.Status, "active");
  assert.equal(rec.Verified, false);
  assert.equal(rec.Revision, 1);
  assert.equal(rec.CreatedAt, "2026-09-01T12:00:00.000Z");
  assert.equal(rec.UpdatedAt, rec.CreatedAt);
  assert.match(rec.Id, /^prf_[0-9A-HJKMNP-TV-Z]{26}$/, "ULID-shaped, Crockford base32");
  console.log("✓ record shape and id format match the stored objects");
}

{
  const ids = new Set(Array.from({ length: 500 }, () => newProfileId()));
  assert.equal(ids.size, 500, "ids are unique");
  const a = newProfileId(1000), b = newProfileId(2000);
  assert.ok(a < b, "ids sort by creation time");
  console.log("✓ ids are unique and time-sortable");
}

// ── append rules ─────────────────────────────────────────────────────────
{
  const rec = buildProfileRecord(validateProfileInput({ displayName: "Mia" }));
  const existing = [{ Id: "prf_a", DisplayName: "Ops Console" }];
  const next = appendProfile(existing, rec);
  assert.equal(next.length, 2, "appends");
  assert.deepEqual(next[0], existing[0], "existing entries are preserved verbatim");
  assert.equal(next[1].DisplayName, "Mia");
  assert.notEqual(next, existing, "does not mutate the input array");
  assert.equal(existing.length, 1);
  console.log("✓ append preserves existing entries without mutating");
}

{
  const rec = buildProfileRecord(validateProfileInput({ displayName: "ops console" }));
  throws(
    () => appendProfile([{ Id: "p", DisplayName: "Ops Console" }], rec),
    /already a profile called/,
    "duplicate name",
  );
  console.log("✓ duplicate display names rejected, case-insensitively");
}

{
  const rec = buildProfileRecord(validateProfileInput({ displayName: "One too many" }));
  const full = Array.from({ length: 3 }, (_, i) => ({ DisplayName: `p${i}` }));
  throws(() => appendProfile(full, rec, { cap: 3 }), /maximum allowed/, "cap");
  assert.equal(appendProfile(full.slice(0, 2), rec, { cap: 3 }).length, 3, "cap is inclusive");
  console.log("✓ profile cap enforced");
}

{
  const rec = buildProfileRecord(validateProfileInput({ displayName: "First" }));
  for (const empty of [undefined, null, "nonsense"]) {
    assert.equal(appendProfile(empty, rec).length, 1, "absent Profiles[] starts a new array");
  }
  console.log("✓ missing or malformed Profiles[] is tolerated");
}

console.log("\nAll profile tests passed.");
