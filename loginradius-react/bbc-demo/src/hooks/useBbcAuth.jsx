"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLRAuth, useLoginRadiusSDK } from "@loginradius/loginradius-react";
import { useSessionGuard } from "./useSessionGuard.jsx";

// One place for everything the BBC chrome needs from the SDK.
//
// B2C specifics worth knowing before editing this:
//  • `pkceLogin.isAuthenticated` / `.tenantAccessToken` / `.profile` are always
//    empty on a B2C tenant — useLRAuth nulls the tenant session whenever
//    options.isB2BEnabled is false. Only `getAuthorizeEndpoint()` and `login()`
//    are usable from that object. Read auth state from the top-level fields.
//  • `useLRAuth().user` is never populated (the hook never calls its setter),
//    so the profile comes from the provider's `profileData` instead.
export function useBbcAuth() {
  const { isAuthenticated, loading, accessToken, logout, pkceLogin } = useLRAuth();
  const { lrInstance, profileData, setProfileData } = useLoginRadiusSDK();
  const { handleError } = useSessionGuard();

  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState(null);
  const fetchedRef = useRef(false);

  // Populate the shared profile cache once we hold a token. The SDK's profile
  // widgets read the same context, so doing it here means they mount with data
  // already present instead of each firing their own getAccount.
  useEffect(() => {
    if (!lrInstance || !accessToken || profileData || fetchedRef.current) return;
    fetchedRef.current = true;
    let cancelled = false;

    lrInstance.controller.getAccount(
      accessToken,
      (response) => {
        if (cancelled) return;
        if (response?.success && response.data) {
          setProfileData(response.data);
        } else if (response) {
          handleError(response.error || response);
        }
      },
      (error) => {
        if (cancelled) return;
        if (!handleError(error)) {
          console.warn("[BBC] Failed to load account profile", error);
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [lrInstance, accessToken, profileData, setProfileData, handleError]);

  const startSignIn = useCallback(async () => {
    setAuthError(null);
    setSigningIn(true);
    try {
      // The SDK generates the verifier, stores it in sessionStorage and builds
      // the authorize URL with code_challenge=S256. No secret in the browser.
      const url = await pkceLogin.getAuthorizeEndpoint();
      if (!url) throw new Error("Authorization URL was empty");

      // Carry any params already on the page (?vtype=…&vtoken=… from a
      // verification email, ?action=…) through to the hosted page.
      const authorizeUrl = new URL(url);
      new URLSearchParams(window.location.search).forEach((value, key) => {
        authorizeUrl.searchParams.set(key, value);
      });

      window.location.assign(authorizeUrl.toString());
    } catch (err) {
      setSigningIn(false);
      setAuthError(
        err?.message ||
          "We couldn't start sign in. Check the OIDC configuration and try again.",
      );
    }
  }, [pkceLogin]);

  const signOut = useCallback(async () => {
    try {
      // ssoLogout also clears StorageCache and the org snapshot the PKCE
      // exchange leaves behind, so a stale org_id can't leak into the next
      // authorize call.
      await lrInstance?.controller?.ssoLogout();
      startSignIn();
    } catch (err) {
      console.warn("[BBC] Sign out call failed; clearing locally anyway", err);
    } finally {
      // setTimeout(() => window.location.assign(window.location.origin + "/"), 50)
    }
  }, [lrInstance, logout, setProfileData]);

  const user = useMemo(() => derivePerson(profileData), [profileData]);

  return {
    isAuthenticated,
    loading,
    accessToken,
    profileData,
    user,
    signingIn,
    authError,
    startSignIn,
    signOut,
  };
}

function derivePerson(profile) {
  if (!profile) return null;
  const email = profile.Email?.[0]?.Value || "";
  const first = profile.FirstName || "";
  const last = profile.LastName || "";
  const name =
    profile.FullName?.trim() ||
    `${first} ${last}`.trim() ||
    profile.UserName ||
    email.split("@")[0] ||
    "You";
  const initials =
    ((first[0] || name[0] || "B") + (last[0] || "")).toUpperCase() || "B";
  return {
    name,
    firstName: first || name.split(" ")[0],
    email,
    initials,
    emailVerified: !!profile.EmailVerified,
    uid: profile.Uid,
  };
}