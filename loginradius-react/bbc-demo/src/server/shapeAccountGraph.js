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

  // Holding "child" links makes you a parent; holding "parent" links, a child.
  // Neither is a standalone account with nothing linked yet.
  const role = children.length ? "parent" : parents.length ? "child" : "unlinked";

  return {
    viewer: { uid: viewerUid, role },
    objectRecordId: parsed.objectRecordId,
    children,
    parents,
    profiles: parsed.profiles.map(normalizeProfile),
    counts: {
      children: children.length,
      parents: parents.length,
      profiles: parsed.profiles.length,
      unresolved: linkedAccounts.filter((l) => l.unresolved).length,
    },
  };
}
