import { NavLink } from "react-router-dom";
import { OrganizationSwitcher } from "@loginradius/loginradius-react-sdk";
import { I } from "./Icons.jsx";
import { useAccountProfile } from "../hooks/useAccountProfile.jsx";

const NAV = [
  {
    items: [{ to: "/admin", icon: <I.Home />, label: "Dashboard", end: true }],
  },
  {
    title: "CRM",
    items: [
      { to: "/admin/deals", icon: <I.Briefcase />, label: "Deals" },
    ],
  },
  {
    title: "Team & Access",
    items: [
      { to: "/admin/users", icon: <I.Users />, label: "Team", countKey: "users" },
      { to: "/admin/roles", icon: <I.Shield />, label: "Roles", countKey: "roles" },
    ],
  },
  {
    title: "Integrations",
    items: [
      { to: "/admin/connections", icon: <I.Plug />, label: "Connections" },
      { to: "/admin/domains", icon: <I.Globe />, label: "Domains", countKey: "domains" },
      { to: "/admin/scim", icon: <I.Sync />, label: "SCIM" },
      { to: "/admin/security", icon: <I.Lock />, label: "Security" },
    ],
  },
  {
    title: "Workspace",
    items: [
      { to: "/admin/settings", icon: <I.Settings />, label: "Settings" },
    ],
  },
];

function deriveSidebarUser(profileData, fallback) {
  if (!profileData) return fallback;

  const firstName = profileData.Firstname ?? "";
  const lastName = profileData.Lastname ?? "";
  const email = profileData.Email?.[0]?.Value ?? "";
  const name =
    profileData.Fullname ||
    `${firstName} ${lastName}`.trim() ||
    email ||
    fallback?.name ||
    "Signed-in user";
  const initials =
    ((firstName[0] || email[0] || fallback?.initials?.[0] || "U") +
      (lastName[0] || "")).toUpperCase();
  const imageUrl =
    profileData.Imageurl ||
    profileData.Thumbnailimageurl ||
    profileData.Httpsimageurl ||
    profileData.Gravatarimageurl ||
    null;

  return {
    name,
    email: email || fallback?.email || "",
    initials,
    imageUrl,
  };
}

export function Sidebar({ user, counts, onSignOut }) {
  const { profileData } = useAccountProfile();
  const display = deriveSidebarUser(profileData, user);

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <I.Helix />
        </div>
        <div>
          <div className="brand-name">PubSpot</div>
          <div className="brand-tag">CRM Platform</div>
        </div>
      </div>

      <OrganizationSwitcher />

      <nav className="nav">
        {NAV.map((section, sIdx) => (
          <div className={section.title ? "nav-section" : ""} key={sIdx}>
            {section.title && <div className="nav-section-title">{section.title}</div>}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              >
                <span className="icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.countKey && counts[item.countKey] != null && (
                  <span className="count">{counts[item.countKey]}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink
          to="/admin/profile"
          title="My profile"
          className={({ isActive }) => `sidebar-footer-link ${isActive ? "active" : ""}`}
          style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0, textDecoration: "none", color: "inherit", cursor: "pointer" }}
        >
          <div className="user-avatar" style={display.imageUrl ? { padding: 0, overflow: "hidden" } : undefined}>
            {display.imageUrl ? (
              <img
                src={display.imageUrl}
                alt={display.name}
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", display: "block" }}
                referrerPolicy="no-referrer"
              />
            ) : (
              display.initials
            )}
          </div>
          <div className="user-meta">
            <div className="user-name">{display.name}</div>
            <div className="user-email">{display.email}</div>
          </div>
        </NavLink>
        <button className="icon-btn" title="Sign out" onClick={onSignOut}>
          <I.LogOut />
        </button>
      </div>
    </aside>
  );
}
