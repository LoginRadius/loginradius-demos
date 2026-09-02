"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Masthead, Footer, LoadingScreen } from "../components/Chrome.jsx";
import { I } from "../components/Icons.jsx";
import { useProfiles } from "../context/ProfileContext.jsx";
import { AddProfileForm } from "./profiles/AddProfileForm.jsx";
import { resolveGateState, safeNext } from "./profiles/gate.js";

// The profile gate: who's watching, plus the linked accounts behind it.
//
// Three entry states, all driven off the same graph:
//   no profiles    → add one first, then it becomes active
//   one profile    → adopted silently, straight through
//   many profiles  → choose
export function Profiles() {
  const {
    status, error, graph, profiles, accessToken,
    activeProfileId, selectProfile, applyGraph, reload,
  } = useProfiles();

  const router = useRouter();
  const searchParams = useSearchParams();
  const [adding, setAdding] = useState(false);

  const next = safeNext(searchParams.get("next"));
  const gate = resolveGateState({ status, profiles, activeProfileId });

  const autoSelected = useRef(false);

  const proceed = useCallback(() => router.replace(next), [router, next]);

  // Exactly one profile and nothing chosen: adopt it and move on. Guarded by
  // a ref so a re-render mid-navigation can't fire it twice.
  useEffect(() => {
    if (gate !== "adopt-one" || autoSelected.current) return;
    autoSelected.current = true;
    if (selectProfile(profiles[0].id)) proceed();
  }, [gate, profiles, selectProfile, proceed]);

  // Arriving with a profile already active (e.g. via "switch profile" then
  // back) shouldn't strand the viewer here.
  const choose = (id) => {
    if (selectProfile(id)) proceed();
  };

  if (gate === "loading") {
    return (
      <Shell>
        <LoadingScreen title="Loading your profiles" sub="Fetching the accounts linked to yours." />
      </Shell>
    );
  }

  if (gate === "error") {
    return (
      <Shell>
        <div className="profiles-inner">
          <div className="notice">
            <I.Alert width={18} height={18} />
            <div>
              <strong>Couldn&apos;t load your profiles.</strong>
              <div style={{ marginTop: 4 }}>{error}</div>
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={reload}>
                  Try again
                </button>
                {/* The gate fails open, so continuing is always available. */}
                <button type="button" className="btn btn-ghost" onClick={() => router.replace(next)}>
                  Continue without choosing
                </button>
              </div>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  const showAddFirst = gate === "add-first";

  if (gate === "adopt-one") {
    return (
      <Shell>
        <LoadingScreen title="Signing you in" sub="Setting up your profile." />
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="profiles-inner">
        {showAddFirst ? (
          <>
            <h1 className="profiles-title">Create your first profile</h1>
            <p className="profiles-sub">
              Profiles keep watch history and recommendations separate for
              everyone using this account. You&apos;ll need one to continue.
            </p>
            <div className="acct-card" style={{ maxWidth: 520, marginTop: 24 }}>
              <div className="acct-card-body">
                <AddProfileForm
                  accessToken={accessToken}
                  submitLabel="Create profile and continue"
                  onAdded={(nextGraph, profileId) => {
                    // Apply and select in one call — see applyGraph's note on
                    // why selecting separately would validate against stale
                    // state and silently reject the new profile.
                    if (applyGraph(nextGraph, profileId)) proceed();
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <h1 className="profiles-title">Who&apos;s watching?</h1>
            <p className="profiles-sub">Choose a profile to continue.</p>

            <div className="tile-grid">
              {profiles.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`profile-tile${p.id === activeProfileId ? " active" : ""}`}
                  onClick={() => choose(p.id)}
                >
                  <span className="tile-avatar" aria-hidden="true">
                    {(p.displayName || "?")[0].toUpperCase()}
                  </span>
                  <span className="tile-name">{p.displayName}</span>
                  <span className="tile-sub">
                    {p.isMinimumAge ? "Kids" : "Standard"}
                    {p.id === activeProfileId ? " · active" : ""}
                  </span>
                </button>
              ))}

              <button
                type="button"
                className="profile-tile add"
                onClick={() => setAdding((v) => !v)}
              >
                <span className="tile-avatar add" aria-hidden="true">+</span>
                <span className="tile-name">Add profile</span>
              </button>
            </div>

            {adding && (
              <div className="acct-card" style={{ maxWidth: 520, marginTop: 24 }}>
                <div className="acct-card-head">
                  <div><h3>Add a profile</h3></div>
                </div>
                <div className="acct-card-body">
                  <AddProfileForm
                    accessToken={accessToken}
                    onCancel={() => setAdding(false)}
                    onAdded={(nextGraph) => {
                      applyGraph(nextGraph);
                      setAdding(false);
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}

        <LinkedAccountsBlock graph={graph} />
      </div>
    </Shell>
  );
}

function LinkedAccountsBlock({ graph }) {
  const role = graph?.viewer?.role;
  const accounts = role === "child" ? graph.parents : graph.children;
  const heading = role === "child" ? "Your guardians" : "Linked child accounts";

  return (
    <section className="profiles-linked">
      <div className="section-head">
        <h2 className="section-title">{heading}</h2>
      </div>
      {!accounts || accounts.length === 0 ? (
        <p className="linked-empty">
          {role === "child"
            ? "No guardian accounts are linked to yours."
            : "No child accounts are linked to this account."}
        </p>
      ) : (
        <ul className="linked-list">
          {accounts.map((a) => (
            <li className="linked-row" key={a.uid}>
              <span className="avatar" aria-hidden="true">
                {(a.displayName || "?")[0].toUpperCase()}
              </span>
              <div className="linked-row-main">
                <div className="linked-row-name">
                  {a.unresolved ? "Unavailable account" : a.displayName}
                  <span className="tag">{role === "child" ? "Guardian" : "Child account"}</span>
                </div>
                <div className="linked-row-meta">
                  {a.unresolved
                    ? a.reason
                    : [a.userName && `@${a.userName}`, a.email].filter(Boolean).join(" · ") || a.uid}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Shell({ children }) {
  return (
    <div className="page-shell">
      <Masthead />
      <main className="page-body profiles-screen">{children}</main>
      <Footer />
    </div>
  );
}
