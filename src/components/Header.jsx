import { I } from "./Icons.jsx";
import { mockData } from "../services/mockData.js";
import { useAccountProfile } from "../hooks/useAccountProfile.jsx";

export function Header({ orgName, crumb }) {
  const { profileData } = useAccountProfile();
  const displayOrgName =
    profileData?.Organizations?.[0]?.Name || orgName || mockData.org.name;

  return (
    <header className="header">
      <div className="crumb">
        <span>{displayOrgName}</span>
        <I.Chev style={{ transform: "rotate(-90deg)", opacity: 0.5 }} />
        <span className="here">{crumb}</span>
      </div>
      <div className="header-actions">
        <div className="searchbar">
          <I.Search />
          <input placeholder="Search users, roles, connections…" />
          <span className="kbd">⌘K</span>
        </div>
        <button className="icon-btn" title="Docs"><I.Book /></button>
        <button className="icon-btn" title="Notifications"><I.Bell /></button>
        <button className="icon-btn" title="Help"><I.Help /></button>
      </div>
    </header>
  );
}
