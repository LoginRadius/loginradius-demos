import { Fragment, useEffect, useState } from "react";
import { I } from "../../components/Icons.jsx";
import { EmptyState, LoadingState } from "../../components/UI.jsx";
import { SDKFrame } from "../../components/SDKFrame.jsx";
import { OrganizationRolesWrapper } from "../../sdk/index.jsx";
import { roleService } from "../../services/roleService.js";
import { mockData } from "../../services/mockData.js";

export function Roles() {
  return (
    <>
      <SDKFrame name="OrganizationRoles" props={{ orgId: mockData.org.id }}>
        <OrganizationRolesWrapper
          onSuccess={(d) => console.log("Roles widget success:", d)}
          onError={(e) => console.error("Roles widget error:", e)}
          fallback={<RolesMock />}
        />
      </SDKFrame>
    </>
  );
}

function RolesMock() {
  const [roles, setRoles] = useState(null);
  useEffect(() => {
    roleService.list().then(setRoles);
  }, []);

  if (roles === null)
    return (
      <div className="card">
        <LoadingState label="Loading roles…" />
      </div>
    );

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3 className="card-title">Roles ({roles.length})</h3>
          <p className="card-sub">
            System roles cannot be edited; custom roles can be tailored to your
            needs.
          </p>
        </div>
      </div>
      {roles.length === 0 ? (
        <EmptyState
          icon={<I.Shield />}
          title="No roles defined"
          body="Create your first custom role to start managing access."
        >
          <button className="btn btn-primary">
            <I.Plus /> Create your first role
          </button>
        </EmptyState>
      ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th>Role</th>
              <th>Description</th>
              <th>Members</th>
              <th>Type</th>
              <th className="col-actions" />
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.id}>
                <td>
                  <div className="user-cell">
                    <div
                      className="avatar"
                      style={{
                        background: "var(--primary-soft)",
                        color: "var(--primary)",
                      }}
                    >
                      <I.Shield />
                    </div>
                    <div>
                      <div className="name">{r.name}</div>
                      <div className="email mono">{r.id}</div>
                    </div>
                  </div>
                </td>
                <td className="muted">{r.description}</td>
                <td>{r.members}</td>
                <td>
                  {r.type === "system" ? (
                    <span className="badge badge-blue">System</span>
                  ) : (
                    <span className="badge badge-violet">Custom</span>
                  )}
                </td>
                <td className="col-actions">
                  <button className="icon-btn">
                    <I.More />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
