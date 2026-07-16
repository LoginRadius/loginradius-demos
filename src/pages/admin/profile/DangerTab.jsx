import { I } from "../../../components/Icons.jsx";
import { DeleteAccount } from "@loginradius/loginradius-react";
function DeleteMock() {
  return (
    <div className="card card-danger">
      <div className="card-head">
        <div>
          <h3 className="card-title" style={{ color: "var(--red)" }}>Delete account</h3>
          <p className="card-sub">
            Permanently delete your Helix account, your profile, and your access to every workspace
            you belong to. Workspaces you own must be transferred or deleted first.
          </p>
        </div>
      </div>
      <div className="card-body">
        <ul className="danger-list">
          <li><I.X style={{ color: "var(--red)" }} /> Your profile, photo, and username will be released</li>
          <li><I.X style={{ color: "var(--red)" }} /> Sessions on all devices will be revoked immediately</li>
          <li><I.X style={{ color: "var(--red)" }} /> Audit-log entries are retained for 90 days per compliance policy</li>
          <li>
            <I.Alert style={{ color: "var(--amber)" }} />
            You're the Owner of <strong>Northwind Cloud</strong>. Transfer ownership first.
          </li>
        </ul>
        <div className="row" style={{ justifyContent: "flex-end", marginTop: 16, gap: 8 }}>
          <button className="btn btn-ghost btn-sm" type="button">Transfer workspace ownership</button>
          <button
            className="btn btn-danger btn-sm"
            type="button"
            disabled
            style={{ opacity: 0.6, cursor: "not-allowed" }}
          >
            <I.Trash /> Delete account
          </button>
        </div>
      </div>
    </div>
  );
}

export function DangerTab({ onSuccess, onError }) {
  return (
    <div className="col" style={{ gap: 16 }}>
      <DeleteAccount
        embedded
        onSuccess={onSuccess}
        onError={onError}
        fallback={<DeleteMock />}
      />
    </div>
  );
}
