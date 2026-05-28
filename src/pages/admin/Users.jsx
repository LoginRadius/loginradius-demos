import { useEffect, useState } from "react";
import { I } from "../../components/Icons.jsx";
import { EmptyState, LoadingState, StatusBadge, TableToolbar } from "../../components/UI.jsx";
import { SDKFrame } from "../../components/SDKFrame.jsx";
import { OrganizationUsersWrapper } from "../../sdk/index.jsx";
import { userService } from "../../services/userService.js";
import { mockData } from "../../services/mockData.js";

export function Users() {
  return (
    <>
      <SDKFrame
        name="OrganizationUsers"
        props={{ orgId: mockData.org.id, onInvite: "() => …" }}
      >
        <OrganizationUsersWrapper
          onSuccess={(d) => console.log("Users widget success:", d)}
          onError={(e) => console.error("Users widget error:", e)}
          fallback={<UsersMock />}
        />
      </SDKFrame>
    </>
  );
}

function UsersMock() {
  const [users, setUsers] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    userService.list().then((rows) => {
      if (!cancelled) setUsers(rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (users === null) return <div className="card"><LoadingState label="Loading members…" /></div>;

  const filtered = users.filter(
    (u) =>
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="card">
      <TableToolbar
        search={search}
        setSearch={setSearch}
        placeholder="Search by name or email"
        filters={[
          { label: "Role", onClick: () => {} },
          { label: "Status", onClick: () => {} },
          { label: "MFA", onClick: () => {} },
        ]}
      />
      {filtered.length === 0 ? (
        <EmptyState
          icon={<I.Users />}
          title="No members yet"
          body="Invite teammates by email to start collaborating on Northwind Cloud."
        >
          <div className="empty-actions">
            <button className="btn btn-primary"><I.Plus /> Invite your first user</button>
          </div>
        </EmptyState>
      ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Status</th>
              <th>MFA</th>
              <th>Last active</th>
              <th className="col-actions" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={i}>
                <td>
                  <div className="user-cell">
                    <div className="avatar" style={{ background: u.color }}>{u.initials}</div>
                    <div>
                      <div className="name">
                        {u.name !== "—" ? u.name : <span className="muted">Pending acceptance</span>}
                      </div>
                      <div className="email">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-slate">{u.role}</span></td>
                <td><StatusBadge status={u.status} /></td>
                <td>
                  {u.mfa ? (
                    <span className="badge badge-green"><span className="dot" />On</span>
                  ) : (
                    <span className="badge badge-slate"><span className="dot" />Off</span>
                  )}
                </td>
                <td className="muted">{u.lastSeen}</td>
                <td className="col-actions"><button className="icon-btn"><I.More /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {filtered.length > 0 && (
        <div
          style={{
            padding: "10px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 12,
            color: "var(--text-3)",
          }}
        >
          <span>Showing {filtered.length} of {users.length} members</span>
          <div className="row">
            <button className="btn btn-ghost btn-sm" disabled style={{ opacity: 0.5 }}>Prev</button>
            <button className="btn btn-ghost btn-sm" disabled style={{ opacity: 0.5 }}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
