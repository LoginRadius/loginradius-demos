"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLRAuth } from "@loginradius/loginradius-react";
import { useSessionGuard } from "../hooks/useSessionGuard.jsx";

// Single source of truth for the account graph (linked accounts + profiles)
// and for which profile the viewer is currently acting as.
//
// SECURITY — read this before using `activeProfile` for anything:
// The active profile is a *UI preference*, not an authorization decision. It
// lives in localStorage, which the user can edit freely. Two consequences:
//
//   1. The stored id is re-validated against the server's profile list on
//      every load (see reconcile below). An id that isn't in the graph is
//      discarded and the gate runs again — a hand-edited value can't
//      conjure a profile that doesn't exist on the identity.
//   2. It still must never gate access to protected content. A user can
//      swap a kids profile for an adult one in devtools. If age limits or
//      personalisation consent have to be *enforced*, the server has to
//      resolve the active profile itself from the access token and the
//      stored object — never from a client-supplied id.
//
// What it is safe for: remembering who was last watching, so a returning
// viewer isn't asked to choose on every visit.

const ProfileContext = createContext(null);

const STORAGE_PREFIX = "bbc.activeProfile.";

// Keyed per uid so a shared browser doesn't carry one account's selection
// into the next person's session.
function storageKey(uid) {
  return uid ? `${STORAGE_PREFIX}${uid}` : null;
}

function readStored(uid) {
  const key = storageKey(uid);
  if (!key || typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    // Safari private mode and "block all cookies" both throw on access.
    // A missing preference is a normal state, so degrade to "not chosen".
    return null;
  }
}

function writeStored(uid, profileId) {
  const key = storageKey(uid);
  if (!key || typeof window === "undefined") return;
  try {
    if (profileId) window.localStorage.setItem(key, profileId);
    else window.localStorage.removeItem(key);
  } catch {
    // Non-fatal: the selection just won't survive a reload.
  }
}

export function ProfileProvider({ children }) {
  const { accessToken, isAuthenticated, loading: authLoading } = useLRAuth();
  const { handleError } = useSessionGuard();

  const [state, setState] = useState({
    status: "idle", // idle | loading | ready | error
    graph: null,
    error: null,
  });
  const [activeProfileId, setActiveProfileId] = useState(null);

  // The uid comes from the graph the server built off the caller's own token,
  // never from anything the client asserted.
  const uid = state.graph?.viewer?.uid ?? null;
  const reconciledFor = useRef(null);

  const load = useCallback(
    async (signal) => {
      if (!accessToken) return;
      setState((s) => ({ ...s, status: "loading", error: null }));
      try {
        const res = await fetch("/api/linked-accounts", {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal,
        });
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          const err = new Error(body?.error || `Request failed (${res.status})`);
          err.status = res.status;
          throw err;
        }
        setState({ status: "ready", graph: body, error: null });
      } catch (err) {
        if (err.name === "AbortError") return;
        // A 401 here means the PKCE token expired; the guard signs out and
        // redirects, so don't paint an error over the top of that.
        if (handleError(err)) return;
        setState({ status: "error", graph: null, error: err.message });
      }
    },
    [accessToken, handleError],
  );

  useEffect(() => {
    if (!accessToken) {
      setState({ status: "idle", graph: null, error: null });
      setActiveProfileId(null);
      reconciledFor.current = null;
      return;
    }
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [accessToken, load]);

  // Reconcile the stored id against what the server actually holds. Runs once
  // per uid per graph load: a profile deleted on another device, or an id
  // typed into devtools, resolves to "nothing selected" rather than to a
  // dangling reference the UI would have to defend against everywhere.
  useEffect(() => {
    if (state.status !== "ready" || !uid) return;
    const profiles = state.graph?.profiles ?? [];
    const stored = readStored(uid);
    const valid = stored && profiles.some((p) => p.id === stored);

    if (!valid && stored) writeStored(uid, null);
    if (reconciledFor.current !== uid || !valid) {
      setActiveProfileId(valid ? stored : null);
      reconciledFor.current = uid;
    }
  }, [state.status, state.graph, uid]);

  const selectProfile = useCallback(
    (profileId) => {
      const profiles = state.graph?.profiles ?? [];
      // Only ever persist an id the server told us about.
      if (!profiles.some((p) => p.id === profileId)) return false;
      writeStored(uid, profileId);
      setActiveProfileId(profileId);
      return true;
    },
    [state.graph, uid],
  );

  const clearProfile = useCallback(() => {
    writeStored(uid, null);
    setActiveProfileId(null);
  }, [uid]);

  // Called after a successful add/update — the route hands back the re-read
  // graph, so adopt it instead of firing another GET.
  //
  // `selectId` selects in the same call, validated against the graph being
  // applied rather than the one in state. Doing it as two calls would fail:
  // setState is not synchronous, so a following selectProfile() would still
  // be checking the *previous* profile list and would reject the profile
  // that was just created.
  const applyGraph = useCallback((graph, selectId) => {
    setState({ status: "ready", graph, error: null });
    if (!selectId) return false;
    const uidForGraph = graph?.viewer?.uid ?? null;
    if (!(graph?.profiles ?? []).some((p) => p.id === selectId)) return false;
    writeStored(uidForGraph, selectId);
    setActiveProfileId(selectId);
    reconciledFor.current = uidForGraph;
    return true;
  }, []);

  const profiles = useMemo(() => state.graph?.profiles ?? [], [state.graph]);
  const activeProfile = useMemo(
    () => profiles.find((p) => p.id === activeProfileId) ?? null,
    [profiles, activeProfileId],
  );

  const value = useMemo(
    () => ({
      status: state.status,
      error: state.error,
      graph: state.graph,
      profiles,
      accessToken,
      isAuthenticated,
      authLoading,
      activeProfileId,
      activeProfile,
      selectProfile,
      clearProfile,
      applyGraph,
      reload: () => load(),
    }),
    [
      state.status, state.error, state.graph, profiles, accessToken,
      isAuthenticated, authLoading, activeProfileId, activeProfile,
      selectProfile, clearProfile, applyGraph, load,
    ],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfiles() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfiles must be used inside <ProfileProvider>");
  return ctx;
}
