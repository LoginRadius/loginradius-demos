import { useState } from "react";
import { I } from "../../components/Icons.jsx";
import { SDKFrame } from "../../components/SDKFrame.jsx";
import { OrganizationDangerZoneWrapper } from "../../sdk/index.jsx";
import { mockData } from "../../services/mockData.js";

export function Danger() {
  return (
    <>
      <SDKFrame name="OrganizationDangerZone" props={{ orgId: mockData.org.id }}>
        <OrganizationDangerZoneWrapper
          onSuccess={(d) => console.log("Danger widget success:", d)}
          onError={(e) => console.error("Danger widget error:", e)}
          fallback={<DangerMock />}
        />
      </SDKFrame>
    </>
  );
}

function DangerMock() {
  const [confirm, setConfirm] = useState("");
  const canDelete = confirm === mockData.org.slug;

  return (
    <>
      <div className="danger-row">
        <div>
          <h4>Transfer ownership</h4>
          <p>Move this workspace to another member. You will be demoted to Admin.</p>
        </div>
        <button className="btn btn-danger-outline">Transfer workspace</button>
      </div>

      <div className="danger-row">
        <div>
          <h4>Reset all settings</h4>
          <p>Restore security, policies, and JIT mappings to defaults. Users and roles are preserved.</p>
        </div>
        <button className="btn btn-danger-outline">Reset settings</button>
      </div>

      <div className="danger-row">
        <div>
          <h4>Revoke all sessions</h4>
          <p>Sign out every member, including you, on every device. They will need to sign in again.</p>
        </div>
        <button className="btn btn-danger-outline">Revoke sessions</button>
      </div>

      <div
        className="card"
        style={{ borderColor: "var(--red-border)", background: "var(--red-soft)", marginTop: 16 }}
      >
        <div
          className="card-head"
          style={{ borderBottom: "1px solid var(--red-border)", background: "transparent" }}
        >
          <div>
            <h3 className="card-title" style={{ color: "var(--red)" }}>Delete this workspace</h3>
            <p className="card-sub">
              Permanently delete <strong>{mockData.org.name}</strong>, all members, roles, audit logs, and connections.{" "}
              This <strong>cannot</strong> be undone.
            </p>
          </div>
        </div>
        <div className="card-body" style={{ background: "var(--bg)" }}>
          <div className="field-help" style={{ marginBottom: 8 }}>
            Type{" "}
            <span
              className="mono"
              style={{ background: "var(--bg-muted)", padding: "1px 6px", borderRadius: 4, color: "var(--text)" }}
            >
              {mockData.org.slug}
            </span>{" "}
            to confirm.
          </div>
          <div className="row">
            <input
              className="input mono"
              placeholder={mockData.org.slug}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              style={{ maxWidth: 300 }}
            />
            <button
              className="btn btn-danger"
              disabled={!canDelete}
              style={{ opacity: canDelete ? 1 : 0.5, cursor: canDelete ? "pointer" : "not-allowed" }}
            >
              <I.Trash /> Permanently delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
