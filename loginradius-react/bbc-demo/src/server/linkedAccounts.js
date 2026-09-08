import "server-only";
import {
  LrError,
  createAccount,
  updateAccountByUid,
  createLinkAccountObject,
  deleteAccountByUid,
  getAccountByUid,
  getLinkAccountObject,
  updateLinkAccountObject,
} from "./loginradius.js";
import {
  canBeDefault,
  normalizeProfile,
  readLinkObject,
  shapeAccountGraph,
} from "./shapeAccountGraph.js";
import {
  ProfileValidationError,
  appendProfile,
  buildProfileRecord,
  validateProfileInput,
} from "./profiles.js";
import {
  ChildAccountError,
  appendChildLink,
  isLinkedChild,
  projectChildAccount,
  validatePassword,
  assertCanPromote,
  buildChildAccountPayload,
  buildChildLinkObject,
  validateChildInput,
} from "./childAccounts.js";

async function resolveGraph(viewerUid, parsed) {
  // Resolve each linked identity. allSettled so one unreadable reference
  // (deleted account, missing permission) degrades that row rather than
  // failing the whole section.
  const settled = await Promise.allSettled(
    parsed.links.map((l) => getAccountByUid(l.ReferenceId)),
  );
  return shapeAccountGraph(viewerUid, parsed, settled);
}

export async function buildAccountGraph(viewerUid) {
  const parsed = readLinkObject(await getLinkAccountObject(viewerUid));
  return resolveGraph(viewerUid, parsed);
}

/**
 * Add a Profile to the viewer's `link_account` object.
 *
 * The API has no "append to array" operation, so this is a read-modify-write:
 * read the current Profiles, append, write the whole array back. There is no
 * ETag or If-Match on this endpoint, so two adds racing on the same identity
 * can lose one of the writes — acceptable for a single-user demo, but a
 * production owner service would serialise writes per uid.
 */
export async function addProfile(viewerUid, input) {
  const clean = validateProfileInput(input);

  const objectResponse = await getLinkAccountObject(viewerUid);
  const parsed = readLinkObject(objectResponse);

  // Linking spec, UI restriction matrix: profiles belong to the guardian's
  // record. Enforced here and not only in the UI — a child's browser can call
  // this route directly.
  const isChild =
    parsed.links.length > 0 &&
    parsed.links.every((l) => String(l.LinkType || "").toLowerCase() === "parent");
  if (isChild) {
    throw new ProfileValidationError(
      "Child accounts cannot add viewing profiles.",
    );
  }

  const record = buildProfileRecord(clean);
  const nextProfiles = appendProfile(parsed.profiles, record);

  // The first standard profile on an account is trivially the main one, so
  // adopt it as the default rather than making the user set it by hand. A
  // kids profile never becomes the default, so an account whose first profile
  // is a kids profile simply has none until a standard one is added.
  const patch = { Profiles: nextProfiles };
  const hasDefault = !!parsed.defaultProfileId;
  if (!hasDefault && canBeDefault(normalizeProfile(record))) {
    patch.DefaultProfileId = record.Id;
  }

  if (!parsed.objectRecordId) {
    // No record yet — create one. LinkedAccounts is seeded empty so the
    // object keeps its expected shape from the start.
    await createLinkAccountObject(viewerUid, {
      LinkedAccounts: [],
      ...patch,
    });
  } else {
    await updateLinkAccountObject(viewerUid, parsed.objectRecordId, patch);
  }

  // Re-read rather than trusting the local copy, so the caller sees exactly
  // what was stored.
  const graph = await buildAccountGraph(viewerUid);
  return { profileId: record.Id, graph };
}

/**
 * Promote a viewing profile into a standalone child account.
 *
 * LoginRadius has no cross-user transaction, so this is a sequence with
 * compensating rollback. Write order matters and is deliberately the reverse
 * of the spec's sketch:
 *
 *   1. create the child identity
 *   2. write the CHILD link object   (points at the parent)
 *   3. write the PARENT link object  (points at the child)  ← last
 *
 * The parent's LinkedAccounts array IS the capability: every child-admin
 * route authorises by looking the childUid up in it. Granting that last means
 * the worst partial state is an orphaned child account that grants nobody
 * anything. Writing the parent first, as the spec sketches, would leave a
 * window where the parent holds admin rights — including password reset —
 * over an account whose own record never recorded the relationship.
 */
export async function promoteProfileToChildAccount(parentUid, input) {
  const parsed = readLinkObject(await getLinkAccountObject(parentUid));
  const isChild =
    parsed.links.length > 0 &&
    parsed.links.every((l) => String(l.LinkType || "").toLowerCase() === "parent");

  assertCanPromote({ isChild, links: parsed.links });
  const clean = validateChildInput(input, { profiles: parsed.profiles });

  // ── 1. create the identity ──────────────────────────────────────────────
  let childUid = null;
  try {
    const created = await createAccount(buildChildAccountPayload(clean));
    childUid = created?.Uid;
    if (!childUid) throw new LrError("Account was created without a uid", 502);
  } catch (err) {
    // A duplicate address is a user-fixable conflict, not a server fault.
    if (/exist|already|duplicate/i.test(err?.message || "")) {
      throw new ChildAccountError(
        "An account with that email address already exists.",
        409,
        "email",
      );
    }
    throw err;
  }

  // ── 2. child link object ────────────────────────────────────────────────
  try {
    await createLinkAccountObject(
      childUid,
      buildChildLinkObject({ parentUid, profile: clean.profile }),
    );
  } catch (err) {
    await rollback({ childUid });
    throw err;
  }

  // ── 3. parent link object (grants the capability) ───────────────────────
  try {
    const links = appendChildLink(parsed.links, { childUid, profileId: clean.profileId });
    if (parsed.objectRecordId) {
      await updateLinkAccountObject(parentUid, parsed.objectRecordId, {
        LinkedAccounts: links,
      });
    } else {
      await createLinkAccountObject(parentUid, {
        LinkedAccounts: links,
        Profiles: parsed.profiles,
      });
    }
  } catch (err) {
    await rollback({ childUid });
    throw err;
  }

  return { childUid, email: clean.email, graph: await buildAccountGraph(parentUid) };
}

/**
 * Best-effort cleanup of a half-built promotion. Only ever deletes an account
 * this request created moments ago.
 *
 * If cleanup itself fails there is nothing further to try automatically — the
 * orphan is logged loudly so it can be reconciled. The read path already
 * tolerates it: an unresolvable ReferenceId degrades to a single greyed row.
 */
async function rollback({ childUid }) {
  if (!childUid) return;
  try {
    await deleteAccountByUid(childUid);
  } catch (cleanupError) {
    console.error(
      `[linked-accounts] ORPHAN child identity ${childUid} — promotion failed and ` +
        `cleanup did not succeed. Needs manual reconciliation.`,
      cleanupError?.message,
    );
  }
}

/**
 * Set the account's default profile.
 *
 * Writes only the DefaultProfileId key. Because it is a top-level scalar
 * rather than a flag on each profile, this cannot race with a concurrent
 * profile add the way rewriting the whole Profiles array would.
 */
export async function setDefaultProfile(viewerUid, profileId) {
  const parsed = readLinkObject(await getLinkAccountObject(viewerUid));

  const isChild =
    parsed.links.length > 0 &&
    parsed.links.every((l) => String(l.LinkType || "").toLowerCase() === "parent");
  if (isChild) {
    throw new ProfileValidationError(
      "Child accounts cannot change the default profile.",
    );
  }

  const raw = parsed.profiles.find((p) => p.Id === profileId);
  if (!raw) {
    throw new ProfileValidationError("That profile is not on this account.", "profileId");
  }
  if (!canBeDefault(normalizeProfile(raw))) {
    throw new ProfileValidationError(
      "A kids profile can't be the default. Choose a standard profile.",
      "profileId",
    );
  }

  if (!parsed.objectRecordId) {
    // Nothing stored yet — shouldn't happen (the profile came from somewhere)
    // but create rather than throw, so the state self-heals.
    await createLinkAccountObject(viewerUid, {
      LinkedAccounts: parsed.links,
      Profiles: parsed.profiles,
      DefaultProfileId: profileId,
    });
  } else {
    await updateLinkAccountObject(viewerUid, parsed.objectRecordId, {
      DefaultProfileId: profileId,
    });
  }

  return { defaultProfileId: profileId, graph: await buildAccountGraph(viewerUid) };
}

/**
 * Delegation gate for every child-admin operation.
 *
 * Reads the CALLER's own link object and requires the target uid to appear in
 * it as a child. A parent can therefore only ever act on their own household;
 * passing another household's uid fails here, before any management call is
 * made. Returns the caller's parsed object so callers don't re-fetch it.
 */
async function assertParentOf(parentUid, childUid) {
  const parsed = readLinkObject(await getLinkAccountObject(parentUid));
  if (!isLinkedChild(parsed.links, childUid)) {
    throw new ChildAccountError(
      "That account is not linked to yours.",
      403,
    );
  }
  return parsed;
}

/** Child account telemetry for the parent dashboard. */
export async function getChildAccount(parentUid, childUid) {
  await assertParentOf(parentUid, childUid);
  return projectChildAccount(await getAccountByUid(childUid));
}

/**
 * Parent-led password reset.
 *
 * Mirrors what the admin console does for support staff — PUT the new
 * password onto the identity via the management API — but scoped by the
 * delegation gate so a parent can only reset their own child's credentials.
 *
 * The password is never logged and never echoed back; the UI shows what the
 * parent typed.
 */
export async function resetChildPassword(parentUid, childUid, input) {
  await assertParentOf(parentUid, childUid);
  const password = validatePassword(input?.newPassword, input?.confirmPassword);
  await updateAccountByUid(childUid, { Password: password });
  return { ok: true };
}

export { LrError, ProfileValidationError, ChildAccountError };
