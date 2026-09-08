"use client";

import { useState } from "react";
import Link from "next/link";
import { I } from "../../components/Icons.jsx";
import { useProfiles } from "../../context/ProfileContext.jsx";
import { PromoteProfile } from "./PromoteProfile.jsx";
import { ManageChild } from "./ManageChild.jsx";
import { useSetDefault } from "../profiles/useSetDefault.js";

// Read-only summary on the account page. Managing profiles lives at
// /profiles — one surface owns that so the two can't drift apart.
export function LinkedAccounts() {
  const { status, error, graph, profiles, activeProfile, accessToken, applyGraph, reload } =
    useProfiles();
  const [managing, setManaging] = useState(null);
  const { setDefault, pendingId, error: defaultError } = useSetDefault();

  if (status === "loading" || status === "idle") {
    return (
      <div className="stack" aria-busy="true">
        <div className="linked-skel" style={{ width: 220 }} />
        <div className="linked-skel" style={{ width: 320, height: 10 }} />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="notice">
        <I.Alert width={18} height={18} />
        <div>
          <strong>Couldn&apos;t load linked accounts.</strong>
          <div style={{ marginTop: 4 }}>{error}</div>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ marginTop: 12 }}
            onClick={reload}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const role = graph?.viewer?.role;
  const linked = role === "child" ? graph.parents : graph.children;
  const linkedLabel = role === "child" ? "guardian account" : "linked child account";

  return (
    <div className="stack">
      {managing && (
        <ManageChild
          child={managing}
          accessToken={accessToken}
          onClose={() => setManaging(null)}
        />
      )}

      <div className="linked-banner">
        <div>
          <div className="linked-banner-title">
            {activeProfile
              ? `Watching as ${activeProfile.displayName}`
              : "No profile selected"}
          </div>
          <div className="linked-banner-sub">
            {profiles.length} profile{profiles.length === 1 ? "" : "s"} ·{" "}
            {linked.length} {linkedLabel}
            {linked.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      {role !== "child" && (
      <section className="acct-card">
        <div className="acct-card-head">
          <div>
            <h3>Profiles and linked accounts</h3>
            <p>
              Add, choose and switch profiles, and see the accounts linked to
              yours.
            </p>
          </div>
        </div>
        <div className="acct-card-body">
          {profiles.length === 0 ? (
            <p className="linked-empty">No profiles yet.</p>
          ) : (
            <ul className="linked-list">
              {profiles.map((p) => (
                <li className="linked-row" key={p.id}>
                  <span className="avatar" aria-hidden="true">
                    {(p.displayName || "?")[0].toUpperCase()}
                  </span>
                  <div className="linked-row-main">
                    <div className="linked-row-name">
                      {p.displayName}
                      {p.isMinimumAge && <span className="tag">Kids</span>}
                      {p.id === graph.defaultProfileId && (
                        <span className="tag tag-on">Default</span>
                      )}
                      {p.id === activeProfile?.id && (
                        <span className="tag">Active</span>
                      )}
                    </div>
                    <div className="linked-row-meta">
                      {p.dateOfBirth
                        ? `Born ${new Date(p.dateOfBirth).toLocaleDateString("en-GB")}`
                        : "No date of birth on file"}
                    </div>
                  </div>
                  {p.id !== graph.defaultProfileId && !p.isMinimumAge && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-row"
                      onClick={() => setDefault(p.id)}
                      disabled={pendingId === p.id}
                    >
                      {pendingId === p.id ? "Saving…" : "Make default"}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {defaultError && (
            <div className="notice" style={{ marginTop: 12 }}>
              <I.Alert width={18} height={18} />
              <div>{defaultError}</div>
            </div>
          )}

          <div
            style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}
          >
            <Link href="/profiles" className="btn btn-secondary">
              Manage profiles <I.Arrow width={18} height={18} />
            </Link>
          </div>
        </div>
      </section>
      )}

      {role !== "child" && (
        <section className="acct-card">
          <div className="acct-card-head">
            <div>
              <h3>Standalone child accounts</h3>
              <p>
                Give a profile its own email and password so they can sign in on
                their own device. You&apos;ll manage the account from here.
              </p>
            </div>
          </div>
          <div className="acct-card-body">
            <PromoteProfile
              profiles={profiles}
              accessToken={accessToken}
              onLinked={(nextGraph) => nextGraph && applyGraph(nextGraph)}
            />
          </div>
        </section>
      )}

      {linked.length > 0 && (
        <section className="acct-card">
          <div className="acct-card-head">
            <div>
              <h3>{role === "child" ? "Your guardians" : "Child accounts"}</h3>
              <p>Each is a separate identity with its own sign-in.</p>
            </div>
          </div>
          <div className="acct-card-body">
            <ul className="linked-list">
              {linked.map((a) => (
                <li className="linked-row" key={a.uid}>
                  <span className="avatar" aria-hidden="true">
                    {(a.displayName || "?")[0].toUpperCase()}
                  </span>
                  <div className="linked-row-main">
                    <div className="linked-row-name">
                      {a.unresolved ? "Unavailable account" : a.displayName}
                    </div>
                    <div className="linked-row-meta">
                      {a.unresolved
                        ? a.reason
                        : [a.userName && `@${a.userName}`, a.email]
                            .filter(Boolean)
                            .join(" · ") || a.uid}
                    </div>
                  </div>
                  {role !== "child" && !a.unresolved && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-row"
                      onClick={() => setManaging(a)}
                    >
                      Manage
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
