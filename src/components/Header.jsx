import { useOrgContext } from "@loginradius/loginradius-react";
import { I } from "./Icons.jsx";
import { mockData } from "../services/mockData.js";

export function Header({ orgName, crumb }) {
  const { currentOrg } = useOrgContext?.() || {};
  // Active org from SDK wins; fall back to the layout prop and finally mock data
  // so the demo still renders something before a real session is established.
  const displayOrgName =
    currentOrg?.OrgName || orgName || mockData.org.name;

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
