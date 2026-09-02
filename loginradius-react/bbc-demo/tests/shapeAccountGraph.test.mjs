// Exercises the link_account shaping against the real payload shapes.
// Run: node tests/shapeAccountGraph.test.mjs
import assert from "node:assert/strict";
import { readLinkObject, shapeAccountGraph } from "../src/server/shapeAccountGraph.js";

const CHILD_OBJECT = {
  Count: 1,
  data: [
    {
      DateCreated: "2026-09-01T07:11:41.171Z",
      IsActive: true,
      CustomObject: {
        LinkedAccounts: [
          { LinkType: "parent", ReferenceId: "be9f220bab134d3596d6f08e4705d3b3" },
          { LinkType: "parent", ReferenceId: "8feecc1d78c54ec08bf3ec140dc1f8f2" },
          { LinkType: "parent", ReferenceId: "d788581e081f41d0998fa451e1eca5a9" },
        ],
      },
      Id: "6a967aad95cf8de2cbfc9ea5",
      Uid: "f8f8370165f84e99b848a80c1e4b2652",
    },
  ],
};

const PARENT_OBJECT = {
  Count: 1,
  data: [
    {
      IsActive: true,
      CustomObject: {
        LinkedAccounts: [
          { LinkType: "child", ReferenceId: "55cfd2fe55e3404b86ab0b462fee436e" },
          { LinkType: "child", ReferenceId: "3294024dca0e42e0a22bf9965f87126b" },
        ],
        Profiles: [
          {
            AllowMarketingDataTransfer: false,
            AllowPersonalisation: false,
            CreatedAt: "2026-08-31T10:00:00Z",
            DateOfBirth: "1995-05-15T00:00:00Z",
            DisplayName: "Ops Console",
            Id: "prf_01H123456",
            IsMinimumAge: true,
            Revision: 1,
            Status: "active",
            UpdatedAt: "2026-08-31T10:00:00Z",
            Verified: false,
          },
          {
            AllowMarketingDataTransfer: false,
            AllowPersonalisation: false,
            CreatedAt: "2026-08-31T10:00:00Z",
            DateOfBirth: "1995-05-15T00:00:00Z",
            DisplayName: "Ops ",
            Id: "prf_01H1234567",
            IsMinimumAge: true,
            Revision: 1,
            Status: "active",
            UpdatedAt: "2026-08-31T10:00:00Z",
            Verified: false,
          },
        ],
      },
      Id: "6a95d876a4b57217aa90f373",
      Uid: "512fc236f84244059acba34350f67799",
    },
  ],
};

const account = (over = {}) => ({
  Uid: "x",
  FirstName: "Jane",
  LastName: "Doe",
  Email: [{ Value: "jane@example.com" }],
  IsActive: true,
  ...over,
});
const ok = (v) => ({ status: "fulfilled", value: v });
const fail = (m) => ({ status: "rejected", reason: new Error(m) });

// ── child viewer ─────────────────────────────────────────────────────────
{
  const parsed = readLinkObject(CHILD_OBJECT);
  assert.equal(parsed.links.length, 3);
  assert.equal(parsed.profiles.length, 0, "child object carries no Profiles[]");
  assert.equal(parsed.objectRecordId, "6a967aad95cf8de2cbfc9ea5");

  const graph = shapeAccountGraph(
    "f8f8370165f84e99b848a80c1e4b2652",
    parsed,
    [ok(account()), ok(account({ UserName: "guardian2" })), fail("deleted")],
  );
  assert.equal(graph.viewer.role, "child", "parent links ⇒ viewer is a child");
  assert.equal(graph.parents.length, 3);
  assert.equal(graph.children.length, 0);
  assert.equal(graph.counts.unresolved, 1);
  assert.equal(graph.parents[0].displayName, "Jane Doe");
  assert.equal(graph.parents[1].displayName, "Jane Doe");
  assert.equal(graph.parents[2].unresolved, true);
  assert.equal(graph.parents[2].reason, "deleted");
  console.log("✓ child viewer: 3 guardians, 1 unresolved, role=child");
}

// ── parent viewer ────────────────────────────────────────────────────────
{
  const parsed = readLinkObject(PARENT_OBJECT);
  const graph = shapeAccountGraph("512fc236f84244059acba34350f67799", parsed, [
    ok(account({ UserName: "sam_doe_07", FirstName: "Sam", LastName: "" })),
    ok(account({ FullName: "Lily Doe", IsActive: false })),
  ]);
  assert.equal(graph.viewer.role, "parent", "child links ⇒ viewer is a parent");
  assert.equal(graph.children.length, 2);
  assert.equal(graph.parents.length, 0);
  assert.equal(graph.children[0].displayName, "Sam");
  assert.equal(graph.children[0].userName, "sam_doe_07");
  assert.equal(graph.children[1].isActive, false, "IsActive false is surfaced");
  assert.equal(graph.profiles.length, 2);
  assert.equal(graph.profiles[0].displayName, "Ops Console");
  assert.equal(graph.profiles[0].isMinimumAge, true);
  assert.equal(graph.profiles[0].allowPersonalisation, false);
  assert.equal(graph.profiles[0].revision, 1);
  assert.equal(graph.counts.profiles, 2);
  console.log("✓ parent viewer: 2 children, 2 profiles, role=parent");
}

// ── identity with no custom object at all ────────────────────────────────
{
  for (const empty of [null, {}, { Count: 0, data: [] }]) {
    const graph = shapeAccountGraph("solo", readLinkObject(empty), []);
    assert.equal(graph.viewer.role, "unlinked");
    assert.deepEqual(graph.children, []);
    assert.deepEqual(graph.profiles, []);
    assert.equal(graph.objectRecordId, null);
  }
  console.log("✓ no record / empty data ⇒ role=unlinked, no throw");
}

// ── defensive: malformed entries ─────────────────────────────────────────
{
  const parsed = readLinkObject({
    data: [{ CustomObject: { LinkedAccounts: [{ LinkType: "CHILD", ReferenceId: "a" }, { LinkType: "child" }, null], Profiles: null } }],
  });
  assert.equal(parsed.links.length, 1, "entries without ReferenceId are dropped");
  const graph = shapeAccountGraph("v", parsed, [ok(account({ FirstName: "", LastName: "", Email: [], UserName: "" }))]);
  assert.equal(graph.children.length, 1, "LinkType casing is normalised");
  assert.equal(graph.children[0].displayName, "Unknown account");
  assert.deepEqual(graph.profiles, [], "Profiles: null is tolerated");
  console.log("✓ malformed entries: dropped/normalised without throwing");
}

// ── missing-record detection (LoginRadius 1057, served as HTTP 403) ──────
{
  const { isMissingRecordError, CUSTOM_OBJECT_RECORD_NOT_EXIST } = await import(
    "../src/server/errors.js"
  );
  assert.equal(CUSTOM_OBJECT_RECORD_NOT_EXIST, 1057);
  assert.equal(isMissingRecordError({ code: 1057 }), true, "numeric code");
  assert.equal(isMissingRecordError({ code: "1057" }), true, "string code");
  assert.equal(isMissingRecordError({ code: 1064 }), false, "bad object name is a real error");
  assert.equal(isMissingRecordError({ code: 905 }), false, "auth failure is a real error");
  assert.equal(isMissingRecordError(null), false);
  assert.equal(isMissingRecordError({}), false);
  console.log("\u2713 1057 recognised as an empty state; other codes still fail");
}

console.log("\nAll shaping tests passed.");
