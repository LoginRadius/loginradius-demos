import { useState } from "react";
import { I } from "../../components/Icons.jsx";
import { ToggleRow } from "../../components/UI.jsx";
import { SDKFrame } from "../../components/SDKFrame.jsx";
import { OrganizationPolicyWrapper } from "../../sdk/index.jsx";
import { mockData } from "../../services/mockData.js";

export function Security() {
  const [tab, setTab] = useState("mfa");

  return (
    <SDKFrame name="OrganizationPolicy" props={{ orgId: mockData.org.id }}>
      <OrganizationPolicyWrapper
        onSuccess={(d) => console.log("Policy widget success:", d)}
        onError={(e) => console.error("Policy widget error:", e)}
        fallback={<PolicyMock />}
      />
    </SDKFrame>
  );
}

function PolicyMock() {
  const [policy, setPolicy] = useState({
    sessionMin: 480,
    idleMin: 30,
    requirePwReset: 90,
  });

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3 className="card-title">Session & access policies</h3>
          <p className="card-sub">
            Control how long sessions last and where members can sign in from.
          </p>
        </div>
      </div>
      <div className="form-row">
        <div className="form-row-label">
          <h4>Maximum session length</h4>
          <p>Members will be signed out after this period.</p>
        </div>
        <div className="form-row-control">
          <select
            className="select"
            style={{ maxWidth: 200 }}
            value={policy.sessionMin}
            onChange={(e) =>
              setPolicy({ ...policy, sessionMin: Number(e.target.value) })
            }
          >
            <option value={60}>1 hour</option>
            <option value={240}>4 hours</option>
            <option value={480}>8 hours</option>
            <option value={1440}>24 hours</option>
            <option value={10080}>7 days</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-row-label">
          <h4>Idle timeout</h4>
          <p>Sign out members after inactivity in the browser.</p>
        </div>
        <div className="form-row-control">
          <select
            className="select"
            style={{ maxWidth: 200 }}
            value={policy.idleMin}
            onChange={(e) =>
              setPolicy({ ...policy, idleMin: Number(e.target.value) })
            }
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={0}>Never</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-row-label">
          <h4>Password rotation</h4>
          <p>Require password reset after N days for non-SSO members.</p>
        </div>
        <div className="form-row-control">
          <select
            className="select"
            style={{ maxWidth: 200 }}
            value={policy.requirePwReset}
            onChange={(e) =>
              setPolicy({ ...policy, requirePwReset: Number(e.target.value) })
            }
          >
            <option value={0}>Never</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
          </select>
        </div>
      </div>
    </div>
  );
}
