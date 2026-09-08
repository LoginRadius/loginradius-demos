// Pure shaping of the `link_account` custom object into what the UI renders.
//
// No I/O and no server-only import, so it can be exercised directly against
// sample payloads. The record is one per identity and holds both halves of
// the model:
//   CustomObject.LinkedAccounts[] — { LinkType: "parent" | "child", ReferenceId }
//   CustomObject.Profiles[]       — viewer-owned profile records
//
// LinkType names the *other* end of the link, so an identity carrying
// "child" entries is itself a parent, and vice versa.

export function pickDisplayName(account) {
  const email = account?.Email?.[0]?.Value || "";
  return (
    account?.FullName?.trim() ||
    [account?.FirstName, account?.LastName].filter(Boolean).join(" ").trim() ||
    account?.UserName ||
    email.split("@")[0] ||
    "Unknown account"
  );
}

export function normalizeProfile(p) {
  return {
    id: p.Id,
    displayName: p.DisplayName,
    dateOfBirth: p.DateOfBirth || null,
    isMinimumAge: !!p.IsMinimumAge,
    allowPersonalisation: !!p.AllowPersonalisation,
    allowMarketingDataTransfer: !!p.AllowMarketingDataTransfer,
    status: p.Status || "unknown",
    verified: !!p.Verified,
    revision: p.Revision ?? null,
    createdAt: p.CreatedAt || null,
    updatedAt: p.UpdatedAt || null,
  };
}

/**
 * A kids profile must never be the account default.
 *
 * The default is what someone lands on unattended, and a kids profile carries
 * restricted content plus different personalisation consent. This is a
 * correctness rule rather than a security boundary — kids is the *more*
 * restrictive mode, and the picker can select any profile regardless — but
 * keeping it in one place stops the two surfaces disagreeing.
 */
export function canBeDefault(profile) {
  if (!profile) return false;
  if (profile.isMinimumAge) return false;
  return profile.status !== "deleted";
}

/**
 * Reconcile the stored DefaultProfileId against the profiles that actually
 * exist and are still eligible. A profile deleted elsewhere, or edited into a
 * kids profile, leaves a dangling id — resolve it to "no default" rather than
 * to a reference every consumer then has to defend against.
 */
export function resolveDefaultProfileId(storedId, profiles) {
  if (!storedId) return null;
  const match = (profiles || []).find((p) => p.id === storedId);
  return match && canBeDefault(match) ? storedId : null;
}

/** Default first, then creation order — the picker shows it in the lead slot. */
export function sortProfilesForPicker(profiles, defaultProfileId) {
  if (!defaultProfileId) return profiles;
  const rest = profiles.filter((p) => p.id !== defaultProfileId);
  const first = profiles.find((p) => p.id === defaultProfileId);
  return first ? [first, ...rest] : profiles;
}

/** Pull the links and profiles out of a custom-object response. */
export function readLinkObject(objectResponse) {
  // No record yet is a normal state, not an error — the identity simply has
  // no links or profiles.
  const record = objectResponse?.data?.[0];
  const custom = record?.CustomObject || {};
  return {
    objectRecordId: record?.Id || null,
    links: (Array.isArray(custom.LinkedAccounts) ? custom.LinkedAccounts : []).filter(
      (l) => l?.ReferenceId,
    ),
    profiles: Array.isArray(custom.Profiles) ? custom.Profiles : [],
    // Stored as a top-level scalar rather than a flag on each profile: only
    // one value can exist, so "exactly one default" cannot be violated, and
    // setting it writes one key instead of rewriting the whole Profiles array.
    defaultProfileId: custom.DefaultProfileId ?? null,
  };
}

/**
 * @param viewerUid  uid of the signed-in identity
 * @param parsed     output of readLinkObject
 * @param settled    Promise.allSettled results, positionally matching parsed.links
 */
export function shapeAccountGraph(viewerUid, parsed, settled) {
  const linkedAccounts = parsed.links.map((link, i) => {
    const outcome = settled[i];
    const linkType = String(link.LinkType || "").toLowerCase();
    if (!outcome || outcome.status !== "fulfilled") {
      return {
        uid: link.ReferenceId,
        linkType,
        displayName: null,
        unresolved: true,
        reason: outcome?.reason?.message || "Could not load this account",
      };
    }
    const account = outcome.value;
    return {
      uid: link.ReferenceId,
      linkType,
      displayName: pickDisplayName(account),
      userName: account.UserName || null,
      email: account.Email?.[0]?.Value || null,
      emailVerified: !!account.EmailVerified,
      isActive: account.IsActive !== false,
      unresolved: false,
    };
  });

  const children = linkedAccounts.filter((l) => l.linkType === "child");
  const parents = linkedAccounts.filter((l) => l.linkType === "parent");

  // Role precedence follows the linking spec: a single "parent" link is enough
  // to make this identity a child, and that test runs FIRST. A record holding
  // both kinds would otherwise resolve to parent and hand a child account the
  // parent permission set — so the more restrictive reading wins.
  //
  // "unlinked" (nothing linked yet) is a display distinction only; for
  // permissions it is treated as a parent, via isChild below.
  const role = parents.length ? "child" : children.length ? "parent" : "unlinked";
  const isChild = role === "child";

  const profiles = parsed.profiles.map(normalizeProfile);
  const defaultProfileId = resolveDefaultProfileId(parsed.defaultProfileId, profiles);

  return {
    viewer: { uid: viewerUid, role, isChild },
    objectRecordId: parsed.objectRecordId,
    children,
    parents,
    defaultProfileId,
    profiles: sortProfilesForPicker(profiles, defaultProfileId),
    counts: {
      children: children.length,
      parents: parents.length,
      profiles: parsed.profiles.length,
      unresolved: linkedAccounts.filter((l) => l.unresolved).length,
    },
  };
}
