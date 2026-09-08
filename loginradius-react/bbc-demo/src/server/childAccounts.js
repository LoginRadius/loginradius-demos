// Pure logic for promoting a viewing profile into a standalone child account.
// No I/O — validation and payload construction live here so they can be
// exercised directly. Orchestration is in linkedAccounts.js.

export const LINK_CAP = Number(process.env.LOGINRADIUS_LINK_CAP) || 20;

export class ChildAccountError extends Error {
  constructor(message, status = 400, field) {
    super(message);
    this.status = status;
    this.field = field;
  }
}

// Deliberately permissive on the local part so sub-addressing works:
// parents without a separate mailbox for the child use parent+kid@example.com.
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128;

/**
 * Shared password rule for both account creation and the parent-led admin
 * reset, so the two cannot drift apart.
 *
 * The tenant's own PasswordComplexity policy is the real authority — the
 * admin console validates against it before calling the same management API.
 * This demo applies a length floor only and lets LoginRadius reject anything
 * its policy forbids.
 */
export function validatePassword(password, confirmPassword) {
  const value = String(password ?? "");
  if (value.length < MIN_PASSWORD) {
    throw new ChildAccountError(
      `Password must be at least ${MIN_PASSWORD} characters.`,
      400,
      "password",
    );
  }
  if (value.length > MAX_PASSWORD) {
    throw new ChildAccountError(
      `Password must be ${MAX_PASSWORD} characters or fewer.`,
      400,
      "password",
    );
  }
  if (confirmPassword !== undefined && confirmPassword !== value) {
    throw new ChildAccountError("The passwords do not match.", 400, "confirmPassword");
  }
  return value;
}

/**
 * Delegation gate. The caller may only touch a uid that appears in their OWN
 * LinkedAccounts with LinkType "child".
 *
 * This is the entire authorisation model for the child-admin routes: without
 * it, any signed-in parent could pass another household's uid and read or
 * reset that account. Note it reads the *caller's* links, never the target's.
 */
export function isLinkedChild(links, childUid) {
  if (!childUid) return false;
  return (Array.isArray(links) ? links : []).some(
    (l) =>
      l?.ReferenceId === childUid &&
      String(l.LinkType || "").toLowerCase() === "child",
  );
}

/**
 * Projects a management-API account down to what a parent dashboard needs.
 *
 * An allowlist, not a denylist: the raw record carries password metadata,
 * provider tokens and internal ids, and a denylist would leak whatever the
 * API adds next.
 */
export function projectChildAccount(account) {
  return {
    uid: account?.Uid ?? null,
    email: account?.Email?.[0]?.Value ?? null,
    emailVerified: !!account?.EmailVerified,
    isActive: account?.IsActive !== false,
    isDeleted: !!account?.IsDeleted,
    createdDate: account?.CreatedDate ?? null,
    lastLoginDate: account?.LastLoginDate ?? null,
    lastPasswordChangeDate: account?.LastPasswordChangeDate ?? null,
    accountType: account?.CustomFields?.AccountType ?? null,
  };
}

/**
 * Validates the promotion request. Returns normalised values — the caller
 * must never pass the raw body through to LoginRadius.
 */
export function validateChildInput(input, { profiles = [] } = {}) {
  if (!input || typeof input !== "object") {
    throw new ChildAccountError("A request payload is required.");
  }

  // Lowercased before it ever reaches the API: LoginRadius lookups are
  // case-sensitive enough that Child@x.com and child@x.com can diverge.
  const email = String(input.email ?? "").trim().toLowerCase();
  if (!email) throw new ChildAccountError("An email address is required.", 400, "email");
  if (!EMAIL_RE.test(email)) {
    throw new ChildAccountError("That email address is not valid.", 400, "email");
  }

  const password = validatePassword(input.password, input.confirmPassword);

  // The profile must belong to the caller. Taking it on trust would let a
  // parent copy a profile record they were never shown.
  const profileId = String(input.profileId ?? "").trim();
  if (!profileId) {
    throw new ChildAccountError("Select which profile to promote.", 400, "profileId");
  }
  const profile = profiles.find((p) => p.Id === profileId);
  if (!profile) {
    throw new ChildAccountError(
      "That profile is not on this account.",
      400,
      "profileId",
    );
  }

  return { email, password, profileId, profile };
}

/** Guard: the caller must be a parent, and under the link cap. */
export function assertCanPromote({ isChild, links = [] }) {
  if (isChild) {
    throw new ChildAccountError(
      "Child accounts cannot create or link other accounts.",
      403,
    );
  }
  if (links.length >= LINK_CAP) {
    throw new ChildAccountError(
      `This account already has ${LINK_CAP} linked accounts — the maximum allowed.`,
    );
  }
}

/**
 * Registration payload for POST /identity/v2/manage/account.
 *
 * CustomFields values must be strings — the API types them as
 * additionalProperties: { type: string }.
 */
export function buildChildAccountPayload({ email, password }) {
  return {
    Email: [{ Type: "Primary", Value: email }],
    Password: password,
    CustomFields: { AccountType: "child" },
    IsActive: true,
    // The parent owns the mailbox (often via sub-addressing), so the address
    // is treated as pre-verified rather than sending the child a mail they
    // may not be able to read. See FEATURES.md for the caveat.
    EmailVerified: true,
  };
}

/** The child's own link object: points back at the parent, plus the copied profile. */
export function buildChildLinkObject({ parentUid, profile }) {
  return {
    LinkedAccounts: [{ LinkType: "parent", ReferenceId: parentUid }],
    // Copied, not referenced. The two records drift the moment either side
    // edits — nothing reconciles them.
    Profiles: profile ? [{ ...profile }] : [],
  };
}

/** The parent's updated LinkedAccounts array. Returns a new array. */
export function appendChildLink(existingLinks, { childUid, profileId }) {
  const links = Array.isArray(existingLinks) ? existingLinks : [];
  if (links.some((l) => l?.ReferenceId === childUid)) {
    throw new ChildAccountError("That account is already linked.", 409);
  }
  return [...links, { LinkType: "child", ReferenceId: childUid, ProfileId: profileId }];
}
