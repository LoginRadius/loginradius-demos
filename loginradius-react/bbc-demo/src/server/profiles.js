// Pure logic for adding a Profile to the `link_account` custom object.
//
// No I/O — validation, record construction and the array append all live
// here so they can be tested directly. The orchestration (read → write) is
// in linkedAccounts.js.

export const PROFILE_CAP = Number(process.env.LOGINRADIUS_PROFILE_CAP) || 20;

export class ProfileValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.status = 400;
    this.field = field;
  }
}

// Crockford base32, the ULID alphabet — excludes I, L, O and U so ids can't
// be misread aloud or mistyped.
const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function encodeTime(ms, len = 10) {
  let out = "";
  for (let i = len - 1; i >= 0; i--) {
    out = CROCKFORD[ms % 32] + out;
    ms = Math.floor(ms / 32);
  }
  return out;
}

function encodeRandom(len = 16) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < len; i++) out += CROCKFORD[bytes[i] % 32];
  return out;
}

/**
 * ULID-shaped id, matching the `prf_01H…` ids already in the object. The
 * time prefix makes ids sort by creation order, which a random uuid wouldn't.
 */
export function newProfileId(now = Date.now()) {
  return `prf_${encodeTime(now)}${encodeRandom()}`;
}

const MAX_DISPLAY_NAME = 50;

/**
 * Validates and normalises what the client sent. Returns clean values —
 * never trust the request body shape.
 */
export function validateProfileInput(input) {
  if (!input || typeof input !== "object") {
    throw new ProfileValidationError("A profile payload is required.");
  }

  const displayName = String(input.displayName ?? "").trim();
  if (!displayName) {
    throw new ProfileValidationError("Display name is required.", "displayName");
  }
  if (displayName.length > MAX_DISPLAY_NAME) {
    throw new ProfileValidationError(
      `Display name must be ${MAX_DISPLAY_NAME} characters or fewer.`,
      "displayName",
    );
  }

  let dateOfBirth = null;
  if (input.dateOfBirth) {
    const parsed = new Date(input.dateOfBirth);
    if (Number.isNaN(parsed.getTime())) {
      throw new ProfileValidationError("Date of birth is not a valid date.", "dateOfBirth");
    }
    if (parsed.getTime() > Date.now()) {
      throw new ProfileValidationError("Date of birth cannot be in the future.", "dateOfBirth");
    }
    dateOfBirth = parsed.toISOString();
  }

  return {
    displayName,
    dateOfBirth,
    // Booleans are coerced rather than passed through, so a string "false"
    // from a form can't land in the object as a truthy value.
    isMinimumAge: input.isMinimumAge === true || input.isMinimumAge === "true",
    allowPersonalisation:
      input.allowPersonalisation === true || input.allowPersonalisation === "true",
    allowMarketingDataTransfer:
      input.allowMarketingDataTransfer === true ||
      input.allowMarketingDataTransfer === "true",
  };
}

/** Builds the stored record, in the PascalCase shape the object already uses. */
export function buildProfileRecord(clean, { now = new Date(), id } = {}) {
  const iso = now.toISOString();
  return {
    Id: id || newProfileId(now.getTime()),
    DisplayName: clean.displayName,
    DateOfBirth: clean.dateOfBirth,
    IsMinimumAge: clean.isMinimumAge,
    AllowMarketingDataTransfer: clean.allowMarketingDataTransfer,
    AllowPersonalisation: clean.allowPersonalisation,
    Status: "active",
    Verified: false,
    Revision: 1,
    CreatedAt: iso,
    UpdatedAt: iso,
  };
}

/**
 * Appends to the existing Profiles array, enforcing the cap and rejecting a
 * duplicate display name.
 *
 * The whole array is returned because the API has no append operation — the
 * caller writes the complete Profiles value back.
 */
export function appendProfile(existingProfiles, record, { cap = PROFILE_CAP } = {}) {
  const profiles = Array.isArray(existingProfiles) ? existingProfiles : [];

  if (profiles.length >= cap) {
    throw new ProfileValidationError(
      `This account already has ${cap} profiles — the maximum allowed.`,
    );
  }

  const clash = profiles.some(
    (p) =>
      String(p?.DisplayName ?? "").trim().toLowerCase() ===
      record.DisplayName.toLowerCase(),
  );
  if (clash) {
    throw new ProfileValidationError(
      `There is already a profile called “${record.DisplayName}”.`,
      "displayName",
    );
  }

  return [...profiles, record];
}
