"use client";

// The one place the account page touches the SDK.
//
// Each section renders: BBC card chrome we own → a theming scope that maps the
// SDK's --sdk-* custom properties to BBC values → an error boundary → the
// widget itself. Turning NEXT_PUBLIC_USE_SDK off swaps every widget for its static
// fallback without touching page code.

import * as SDK from "@loginradius/loginradius-react";
import { USE_SDK } from "../config/features.js";
import { SDKBoundary } from "./SDKBoundary.jsx";
import { useSessionGuard } from "../hooks/useSessionGuard.jsx";

// Export names as published by @loginradius/loginradius-react. These are the
// profile-scoped components, which differ from the similarly named auth-flow
// steps (e.g. `ChangePin` is the profile section, `ChangePIN` is the login
// step) — mixing them up silently renders the wrong thing.
export const WIDGETS = {
  personalDetails: "PersonalDetails",
  username: "EditUsername",
  email: "AddEmail",
  phone: "EditPhone",
  password: "ChangePassword",
  mfa: "SetupTwoFactorAuth",
  passkey: "AddPasskey",
  pin: "ChangePin",
  backupCodes: "ResetBackupCode",
  social: "LinkAccount",
  deleteAccount: "DeleteAccount",
  avatar: "ProfileAvatar",
};

export function SdkWidget({ name, fallback = null, onError, ...props }) {
  const { handleError } = useSessionGuard();
  const Widget = SDK[name];

  const guardedOnError = (err) => {
    // An expired token ends the session; anything else is the section's own
    // problem and stays inside the section.
    handleError(err);
    onError?.(err);
  };

  if (!USE_SDK) return fallback;

  if (typeof Widget !== "function") {
    console.warn(`[BBC] SDK export "${name}" is missing — rendering fallback.`);
    return fallback;
  }

  return (
    <div className="bbc-sdk-scope">
      <SDKBoundary fallback={fallback} onError={guardedOnError}>
        <Widget {...props} onError={guardedOnError} />
      </SDKBoundary>
    </div>
  );
}

export function AccountCard({ title, sub, tag, children }) {
  return (
    <section className="acct-card">
      <div className="acct-card-head">
        <div>
          <h3>{title}</h3>
          {sub && <p>{sub}</p>}
        </div>
        {tag}
      </div>
      <div className="acct-card-body">{children}</div>
    </section>
  );
}