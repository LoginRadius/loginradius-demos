import { I } from "../../../components/Icons.jsx";
import { PI } from "./ProfileIcons.jsx";
import { SDKCard } from "./SDKCard.jsx";
import {
  ProfileDetailsComponent,
  UsernameComponent,
} from "@loginradius/loginradius-react-sdk";

function ReadRow({ label, value, mono, action }) {
  return (
    <div className="read-row">
      <div className="read-row-label">{label}</div>
      <div className={`read-row-value ${mono ? "mono" : ""}`}>{value}</div>
      {action ? <div className="read-row-action">{action}</div> : <div />}
    </div>
  );
}

function ProfileDetailsMock() {
  return (
    <div className="card-body flush" style={{ padding: 0 }}>
      <ReadRow label="Display name" value="Aria Chen" />
      <ReadRow label="First name" value="Aria" />
      <ReadRow label="Last name" value="Chen" />
      <ReadRow label="Job title" value="Senior Product Manager" />
      <ReadRow label="Department" value="Identity Platform" />
      <ReadRow label="Time zone" value="America/Los_Angeles (PST · UTC−08:00)" />
    </div>
  );
}

function UsernameMock() {
  return (
    <>
      <div className="username-row">
        <div className="username-prefix">helix.app/u/</div>
        <div className="username-handle">aria.chen</div>
        <span className="badge badge-green" style={{ marginLeft: "auto" }}>
          <span className="dot" />
          Available
        </span>
      </div>
      <p className="field-help" style={{ marginTop: 10 }}>
        Changing your username will break existing @mentions. We'll redirect your old URL for 30 days.
      </p>
    </>
  );
}

export function InfoTab({ onSuccess, onError }) {
  return (
    <div className="col" style={{ gap: 16 }}>
      <ProfileDetailsComponent
        embedded
        onSuccess={onSuccess}
        onError={onError}
        fallback={<ProfileDetailsMock />}
      />

      <UsernameComponent
        embedded
        onSuccess={onSuccess}
        onError={onError}
        fallback={<UsernameMock />}
      />
    </div>
  );
}

// Re-export mocks for external reuse / testing.
export { ProfileDetailsMock, UsernameMock };
