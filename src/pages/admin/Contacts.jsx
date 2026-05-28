import { useEffect, useState } from "react";
import { I } from "../../components/Icons.jsx";
import { EmptyState, LoadingState, StatusBadge, TableToolbar } from "../../components/UI.jsx";
import { contactService } from "../../services/contactService.js";

export function Contacts() {
  const [contacts, setContacts] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    contactService.list().then(setContacts);
  }, []);

  if (contacts === null) return <div className="card"><LoadingState label="Loading contacts…" /></div>;

  const filtered = contacts.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="card">
      <TableToolbar
        search={search}
        setSearch={setSearch}
        placeholder="Search by name, email, or company"
        filters={[
          { label: "Status", onClick: () => {} },
          { label: "Owner", onClick: () => {} },
          { label: "Tag", onClick: () => {} },
        ]}
        actions={
          <button className="btn btn-primary btn-sm"><I.Plus /> Add contact</button>
        }
      />
      {filtered.length === 0 ? (
        <EmptyState
          icon={<I.Contact />}
          title="No contacts found"
          body="Add your first contact or adjust your search filters."
        >
          <div className="empty-actions">
            <button className="btn btn-primary"><I.Plus /> Add contact</button>
          </div>
        </EmptyState>
      ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th>Contact</th>
              <th>Company</th>
              <th>Status</th>
              <th>Owner</th>
              <th>Last contact</th>
              <th>Tags</th>
              <th className="col-actions" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="user-cell">
                    <div className="avatar" style={{ background: c.ownerColor, opacity: 0.6 }}>
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <div className="name">{c.name}</div>
                      <div className="email">{c.email}</div>
                    </div>
                  </div>
                </td>
                <td>{c.company}</td>
                <td><StatusBadge status={c.status} /></td>
                <td>
                  <div className="row" style={{ gap: 6, alignItems: "center" }}>
                    <div className="avatar" style={{ width: 20, height: 20, fontSize: 9, background: c.ownerColor }}>{c.ownerInitials}</div>
                    <span style={{ fontSize: 12 }}>{c.owner}</span>
                  </div>
                </td>
                <td className="muted">{c.lastContact}</td>
                <td>
                  <div className="row" style={{ gap: 4, flexWrap: "wrap" }}>
                    {c.tags.map((t) => (
                      <span key={t} className="badge badge-slate" style={{ fontSize: 11 }}>{t}</span>
                    ))}
                  </div>
                </td>
                <td className="col-actions"><button className="icon-btn"><I.More /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {filtered.length > 0 && (
        <div style={{ padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "var(--text-3)" }}>
          <span>Showing {filtered.length} of {contacts.length} contacts</span>
          <div className="row">
            <button className="btn btn-ghost btn-sm" disabled style={{ opacity: 0.5 }}>Prev</button>
            <button className="btn btn-ghost btn-sm" disabled style={{ opacity: 0.5 }}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
