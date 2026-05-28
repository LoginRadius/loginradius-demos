import { useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import {
  useLoginRadiusSDK,
  useLRAuth,
  useOrgContext,
} from "@loginradius/loginradius-react-sdk";

import { Sidebar } from "../components/Sidebar.jsx";
import { Header } from "../components/Header.jsx";
import { mockData } from "../services/mockData.js";
import { AccountProfileProvider, useAccountProfile } from "../hooks/useAccountProfile.jsx";

const CRUMB_BY_PATH = {
  "/admin": "Dashboard",
  "/admin/contacts": "Contacts",
  "/admin/deals": "Deals",
  "/admin/profile": "My Profile",
  "/admin/users": "Team",
  "/admin/roles": "Permissions",
  "/admin/connections": "Connections",
  "/admin/domains": "Domains",
  "/admin/scim": "SCIM",
  "/admin/security": "Security",
  "/admin/settings": "Settings",
};

export function AdminLayout() {
  return (
    <AccountProfileProvider>
      <AdminLayoutInner />
    </AccountProfileProvider>
  );
}

function AdminLayoutInner() {
  const { lrInstance, loading } = useLoginRadiusSDK();
  const { isAuthenticated } = useLRAuth();
  const { profileData } = useAccountProfile();
  const orgContext = useOrgContext?.() || {};
  const location = useLocation();

  // Org list / current org — preferred from the SDK's OrgContext, fall back to
  // the mock data so the layout renders fully populated even when no real org
  // is selected yet (e.g. first run with no real backend).
  const orgs = orgContext.organizations?.length
    ? orgContext.organizations
    : mockData.orgs;

  const [currentOrg, setCurrentOrg] = useState(
    () =>
      orgContext.currentOrg ||
      orgs.find((o) => (o.OrgId ?? o.id) === orgContext.currentOrgId) ||
      orgs[0],
  );

  // Surface org-context issues in the console but never block rendering — the
  // layout falls back to mock data for org / users / counts so navigation
  // (Outlet) stays mounted even before a real session is established.
  useEffect(() => {
    if (orgContext.error) {
      console.warn("OrgContext error (rendering with mock fallback):", orgContext.error);
    }
  }, [orgContext.error]);

  useEffect(() => {
    const next =
      orgContext.currentOrg ||
      (orgContext.currentOrgId
        ? orgs.find((o) => (o.OrgId ?? o.id) === orgContext.currentOrgId)
        : null);
    if (next) setCurrentOrg(next);
  }, [orgContext.currentOrg, orgContext.currentOrgId, orgs]);

  const counts = useMemo(
    () => ({
      users: orgContext.members?.length ?? mockData.users.length,
      roles: orgContext.orgRoles?.length ?? mockData.roles.length,
      pendingInvites:
        orgContext.invitations?.filter?.((i) => i.status === "pending")
          ?.length ?? mockData.invitations.filter((i) => i.status === "pending").length,
      domains: orgContext.domains?.length ?? mockData.domains.length,
    }),
    [orgContext.members, orgContext.orgRoles, orgContext.invitations, orgContext.domains],
  );

  // Early returns must come AFTER all hooks so hook call order stays stable
  // across renders (Rules of Hooks).
  if (loading) return <div> Loading </div>;
  if (!isAuthenticated) return <Navigate to="/home" replace />;

  const crumb = CRUMB_BY_PATH[location.pathname] || "Dashboard";

  const handleSwitchOrg = (next) => {
    setCurrentOrg(next);
    // If the SDK exposes a real switcher, call it — best-effort, ignore if missing.
    if (typeof orgContext.switchOrganization === "function") {
      orgContext.switchOrganization(next.id);
    }
  };

  const user = profileData
    ? {
        name: profileData.Firstname
          ? `${profileData.Firstname} ${profileData.Lastname || ""}`.trim()
          : profileData.Email?.[0]?.Value || "Signed-in user",
        email: profileData.Email?.[0]?.Value || "",
        initials: getInitials(profileData),
      }
    : mockData.currentUser;

  const handleSignOut = async () => {
    try {
      await lrInstance?.controller?.ssoLogout?.();
    } catch (err) {
      console.warn("Logout failed, redirecting anyway:", err);
    }
    window.location.href = window.location.origin + "/home";
  };

  return (
    <div className="app">
      <Sidebar
        orgs={orgs}
        currentOrg={currentOrg}
        setCurrentOrg={handleSwitchOrg}
        user={user}
        counts={counts}
        onSignOut={handleSignOut}
      />
      <div className="main">
        <Header orgName={currentOrg?.OrgName || currentOrg?.name || mockData.org.name} crumb={crumb} />
        <div className="content">
          <div className="content-inner">
            <Outlet context={{ currentOrg, orgContext }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function getInitials(profile) {
  const first = profile.Firstname?.[0] || profile.Email?.[0]?.Value?.[0] || "U";
  const last = profile.Lastname?.[0] || "";
  return (first + last).toUpperCase();
}
