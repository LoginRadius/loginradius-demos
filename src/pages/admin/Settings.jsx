import { useState } from "react";
import { I } from "../../components/Icons.jsx";
import { PageHeader } from "../../components/UI.jsx";
import { SDKFrame } from "../../components/SDKFrame.jsx";
import {
  OrganizationDangerZoneWrapper,
  OrganizationSettingsWrapper,
} from "../../sdk/index.jsx";
import { mockData } from "../../services/mockData.js";

export function Settings() {
  return (
    <>
      <PageHeader
        title="Settings"
        sub="General configuration for this workspace."
      />
      <SDKFrame name="OrganizationSettings" props={{ orgId: mockData.org.id }}>
        <div style={{ gap: "16px", flexDirection: "column", display: "flex" }}>
          <OrganizationSettingsWrapper
            onSuccess={(d) => console.log("Settings widget success:", d)}
            onError={(e) => console.error("Settings widget error:", e)}
            fallback={<SettingsMock />}
          />
          <OrganizationDangerZoneWrapper
            onSuccess={(d) => console.log("Danger widget success:", d)}
            onError={(e) => console.error("Danger widget error:", e)}
            fallback={null}
          />
        </div>
      </SDKFrame>
    </>
  );
}

function SettingsMock() {
  const [name, setName] = useState(mockData.org.name);
  const [slug, setSlug] = useState(mockData.org.slug);

  return (
    <>
      <div className="card">
        <div className="card-head">
          <div>
            <h3 className="card-title">Workspace profile</h3>
            <p className="card-sub">
              How this organization appears to members and on shared resources.
            </p>
          </div>
        </div>
        <div className="form-row">
          <div className="form-row-label">
            <h4>Workspace name</h4>
            <p>Visible to all members in the sidebar and on invitations.</p>
          </div>
          <div className="form-row-control">
            <input
              className="input"
              style={{ maxWidth: 360 }}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-row-label">
            <h4>URL slug</h4>
            <p>Used in workspace URLs and as the SCIM tenant identifier.</p>
          </div>
          <div className="form-row-control">
            <div className="row" style={{ maxWidth: 360 }}>
              <span className="mono muted" style={{ padding: "8px 0" }}>
                helix.dev/o/
              </span>
              <input
                className="input mono"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                style={{ flex: 1 }}
              />
            </div>
          </div>
        </div>
        <div className="form-row">
          <div className="form-row-label">
            <h4>Workspace ID</h4>
            <p>Use this for API calls and SDK initialization.</p>
          </div>
          <div className="form-row-control">
            <div className="row" style={{ maxWidth: 420 }}>
              <input
                className="input mono"
                value={mockData.org.id}
                readOnly
                style={{ flex: 1 }}
              />
              <button className="btn btn-secondary btn-sm">
                <I.Copy />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head">
          <div>
            <h3 className="card-title">Region & locale</h3>
            <p className="card-sub">
              Data residency, timezone, and default language for emails.
            </p>
          </div>
        </div>
        <div className="form-row">
          <div className="form-row-label">
            <h4>Data region</h4>
            <p>
              Where this workspace's user data is stored. Cannot be changed
              after creation.
            </p>
          </div>
          <div className="form-row-control">
            <select
              className="select"
              style={{ maxWidth: 260 }}
              defaultValue="us-east"
            >
              <option value="us-east">United States (us-east-1)</option>
              <option value="eu-west">Europe (eu-west-1)</option>
              <option value="ap-south">Asia Pacific (ap-south-1)</option>
            </select>
            <div className="field-help">
              Currently: <span className="mono">us-east-1</span> · GDPR & SOC2
              compliant
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          marginTop: 20,
        }}
      >
        <button className="btn btn-ghost">Discard</button>
        <button className="btn btn-primary">Save changes</button>
      </div>
    </>
  );
}
