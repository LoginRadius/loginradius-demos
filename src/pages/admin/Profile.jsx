import { useState } from "react";
import { useLRAuth } from "@loginradius/loginradius-react";

import { PageHeader } from "../../components/UI.jsx";
import { I } from "../../components/Icons.jsx";
import { mockData } from "../../services/mockData.js";

import { ProfileHero } from "./profile/ProfileHero.jsx";
import { InfoTab } from "./profile/InfoTab.jsx";
import { SecurityTab } from "./profile/SecurityTab.jsx";
import { ContactTab } from "./profile/ContactTab.jsx";
import { ConnectedTab } from "./profile/ConnectedTab.jsx";
import { DangerTab } from "./profile/DangerTab.jsx";

const TABS = [
  { id: "info", label: "Profile info", icon: <I.Users /> },
  { id: "security", label: "Security", icon: <I.Lock /> },
  { id: "contact", label: "Contact info", icon: <I.Mail /> },
  { id: "connected", label: "Connected accounts", icon: <I.Plug /> },
  { id: "danger", label: "Danger zone", icon: <I.Alert /> },
];

function deriveHeroUser(profile) {
  if (profile) {
    const first = profile.FirstName || "";
    const last = profile.LastName || "";
    const email = profile.Email?.[0]?.Value || "";
    const displayName = `${first} ${last}`.trim() || email || "Signed-in user";
    const initials = (
      (first[0] || email[0] || "U") + (last[0] || "")
    ).toUpperCase();
    return {
      name: displayName,
      email,
      initials,
      role: mockData.currentUser.role,
      org: mockData.org.name,
      joined: profile.CreatedDate
        ? new Date(profile.CreatedDate).toLocaleDateString(undefined, {
            month: "short",
            year: "numeric",
          })
        : undefined,
      color: "#1E5DDB",
    };
  }
  return {
    ...mockData.currentUser,
    org: mockData.org.name,
    joined: "Aug 2024",
    color: "#1E5DDB",
  };
}

export function Profile() {
  const { profile } = useLRAuth();
  const [tab, setTab] = useState("info");
  const user = deriveHeroUser(profile);

  // Centralized SDK callbacks — wired into every wrapper so a single onError
  // surface can be observed during integration.
  const handleSuccess = (data) => console.log("[Profile SDK] success:", data);
  const handleError = (err) => console.error("[Profile SDK] error:", err);

  return (
    <>
      <PageHeader
        title="My profile"
        sub="Manage your personal information, sign-in methods, and connected services."
      />

      <ProfileHero user={user} />

      <div className="tabs profile-tabs">
        {TABS.map((t) => (
          <div
            key={t.id}
            className={`tab ${tab === t.id ? "active" : ""} ${t.id === "danger" ? "tab-danger" : ""}`}
            onClick={() => setTab(t.id)}
            role="tab"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setTab(t.id);
              }
            }}
          >
            <span style={{ opacity: 0.8, display: "inline-flex" }}>{t.icon}</span>
            {t.label}
          </div>
        ))}
      </div>

      {tab === "info" && <InfoTab onSuccess={handleSuccess} onError={handleError} />}
      {tab === "security" && <SecurityTab onSuccess={handleSuccess} onError={handleError} />}
      {tab === "contact" && <ContactTab onSuccess={handleSuccess} onError={handleError} />}
      {tab === "connected" && <ConnectedTab onSuccess={handleSuccess} onError={handleError} />}
      {tab === "danger" && <DangerTab onSuccess={handleSuccess} onError={handleError} />}
    </>
  );
}
