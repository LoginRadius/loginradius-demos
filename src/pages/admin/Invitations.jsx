import { useEffect, useState } from "react";
import { I } from "../../components/Icons.jsx";
import { EmptyState, LoadingState } from "../../components/UI.jsx";
import { SDKFrame } from "../../components/SDKFrame.jsx";
import { OrganizationInvitationManagementWrapper } from "../../sdk/index.jsx";
import { userService } from "../../services/userService.js";
import { mockData } from "../../services/mockData.js";

export function Invitations() {
  return (
    <>
      <SDKFrame
        name="OrganizationInvitationManagement"
        props={{ orgId: mockData.org.id }}
      >
        <OrganizationInvitationManagementWrapper
          onSuccess={(d) => console.log("Invitations widget success:", d)}
          onError={(e) => console.error("Invitations widget error:", e)}
          fallback={<InvitationsMock />}
        />
      </SDKFrame>
    </>
  );
}

function InvitationsMock() {
  const [all, setAll] = useState(null);
  const [tab, setTab] = useState("pending");

  useEffect(() => {
    userService.listInvitations().then(setAll);
  }, []);

  if (all === null) return <div className="card"><LoadingState label="Loading invitations…" /></div>;

  const pending = all.filter((i) => i.status === "pending");
  const accepted = all.filter((i) => i.status === "accepted");
  const expired = all.filter((i) => i.status === "expired");
  const list = tab === "pending" ? pending : tab === "accepted" ? accepted : expired;

  return (
    <div className="card">
      <div style={{ padding: "0 18px", borderBottom: "1px solid var(--border)" }}>
        <div className="tabs" style={{ marginBottom: 0, borderBottom: "none" }}>
          <div className={`tab ${tab === "pending" ? "active" : ""}`} onClick={() => setTab("pending")}>
            Pending <span className="count">{pending.length}</span>
          </div>
          <div className={`tab ${tab === "accepted" ? "active" : ""}`} onClick={() => setTab("accepted")}>
            Accepted <span className="count">{accepted.length}</span>
          </div>
          <div className={`tab ${tab === "expired" ? "active" : ""}`} onClick={() => setTab("expired")}>
            Expired <span className="count">{expired.length}</span>
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={<I.Mail />}
          title="No invitations here"
          body={`No ${tab} invitations to show.`}
        >
          <button className="btn btn-primary"><I.Plus /> Invite a user</button>
        </EmptyState>
      ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th>Recipient</th>
              <th>Role</th>
              <th>Invited by</th>
              <th>Sent</th>
              <th>{tab === "pending" ? "Expires" : tab === "accepted" ? "Accepted" : "Expired"}</th>
              <th className="col-actions" />
            </tr>
          </thead>
          <tbody>
            {list.map((inv, i) => (
              <tr key={i}>
                <td><span className="name">{inv.email}</span></td>
                <td><span className="badge badge-slate">{inv.role}</span></td>
                <td className="muted">{inv.invitedBy}</td>
                <td className="muted">{inv.sentAt}</td>
                <td>
                  {inv.status === "pending" && <span className="muted">{inv.expiresAt}</span>}
                  {inv.status === "accepted" && (
                    <span className="badge badge-green"><span className="dot" />{inv.expiresAt}</span>
                  )}
                  {inv.status === "expired" && (
                    <span className="badge badge-slate"><span className="dot" />{inv.expiresAt}</span>
                  )}
                </td>
                <td className="col-actions">
                  {inv.status === "pending" && (
                    <div className="row" style={{ justifyContent: "flex-end" }}>
                      <button className="btn btn-ghost btn-sm"><I.Refresh /> Resend</button>
                      <button className="icon-btn"><I.More /></button>
                    </div>
                  )}
                  {inv.status === "expired" && (
                    <button className="btn btn-ghost btn-sm"><I.Refresh /> Re-invite</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
