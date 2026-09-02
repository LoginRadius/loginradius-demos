"use client";

import dynamic from "next/dynamic";
import { LOGIN_RADIUS_OPTIONS, MISSING_CONFIG } from "../config/features.js";
import { SetupRequired } from "../views/SetupRequired.jsx";
import { ProfileProvider } from "../context/ProfileContext.jsx";
import { ProfileGate } from "../components/ProfileGate.jsx";

// The SDK is browser-only: it reads window/sessionStorage on init and writes
// its theme variables onto document.documentElement. Loading it with
// ssr:false keeps it out of the server bundle entirely, so nothing tries to
// evaluate it during pre-render. `ssr: false` is only legal inside a client
// component, which is why this file carries the directive.
const LoginRadiusProvider = dynamic(
  () =>
    import("@loginradius/loginradius-react").then((m) => m.LoginRadiusProvider),
  { ssr: false },
);

export function Providers({ children }) {
  // Mounting the provider without an apiKey throws and blanks the page, so
  // fail with an explanation instead.
  if (!LOGIN_RADIUS_OPTIONS.apiKey) {
    return <SetupRequired missing={MISSING_CONFIG} />;
  }

  return (
    <LoginRadiusProvider options={LOGIN_RADIUS_OPTIONS}>
      {/* ProfileProvider needs useLRAuth, so it sits inside the SDK provider.
          The gate needs the profile state, so it sits inside that. */}
      <ProfileProvider>
        <ProfileGate>{children}</ProfileGate>
      </ProfileProvider>
    </LoginRadiusProvider>
  );
}
