import "server-only";
import {
  LrError,
  createLinkAccountObject,
  getAccountByUid,
  getLinkAccountObject,
  updateLinkAccountObject,
} from "./loginradius.js";
import { readLinkObject, shapeAccountGraph } from "./shapeAccountGraph.js";
import {
  ProfileValidationError,
  appendProfile,
  buildProfileRecord,
  validateProfileInput,
} from "./profiles.js";

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

  const record = buildProfileRecord(clean);
  const nextProfiles = appendProfile(parsed.profiles, record);

  if (!parsed.objectRecordId) {
    // No record yet — create one. LinkedAccounts is seeded empty so the
    // object keeps its expected shape from the start.
    await createLinkAccountObject(viewerUid, {
      LinkedAccounts: [],
      Profiles: nextProfiles,
    });
  } else {
    await updateLinkAccountObject(viewerUid, parsed.objectRecordId, {
      Profiles: nextProfiles,
    });
  }

  // Re-read rather than trusting the local copy, so the caller sees exactly
  // what was stored.
  const graph = await buildAccountGraph(viewerUid);
  return { profileId: record.Id, graph };
}

export { LrError, ProfileValidationError };
