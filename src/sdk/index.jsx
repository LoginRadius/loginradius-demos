// SDK wrapper layer.
//
// Every wrapper accepts a `fallback` element (the mock UI) and renders either
// the real SDK widget or the mock — gated by the USE_SDK feature flag and an
// error boundary. This keeps page-level code identical regardless of mode.
//
// All wrappers also funnel `onError` through useSessionGuard so any widget API
// call returning "Access Unauthorized" (or equivalent) triggers ssoLogout.

import * as SDK from "@loginradius/loginradius-react-sdk";
import { USE_SDK } from "../config/features.js";
import { SDKBoundary } from "./SDKBoundary.jsx";
import { useSessionGuard } from "../hooks/useSessionGuard.jsx";

const make = (name) => {
  const Widget = SDK[name];
  return function SDKWrapper({ fallback, onError, ...props }) {
    const { handleError } = useSessionGuard();
    const guardedOnError = (err) => {
      handleError(err);
      onError?.(err);
    };
    if (!USE_SDK || typeof Widget !== "function") return fallback;
    return (
      <SDKBoundary fallback={fallback} onError={guardedOnError}>
        <Widget {...props} onError={guardedOnError} />
      </SDKBoundary>
    );
  };
};

export const OrganizationUsersWrapper = make("OrganizationUsers");
export const OrganizationRolesWrapper = make("OrganizationRoles");
export const OrganizationConnectionsWrapper = make("OrganizationConnections");
export const OrganizationInvitationManagementWrapper = make(
  "OrganizationInvitationManagement",
);
export const OrganizationDomainManagementWrapper = make(
  "OrganizationDomainManagement",
);
export const OrganizationSCIMWrapper = make("OrganizationSCIM");
export const OrganizationSettingsWrapper = make("OrganizationSettings");
export const OrganizationDangerZoneWrapper = make("OrganizationDangerZone");
export const OrganizationPolicyWrapper = make("OrganizationPolicy");
