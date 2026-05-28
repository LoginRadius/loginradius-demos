import { I } from "../../components/Icons.jsx";
import { EmptyState } from "../../components/UI.jsx";
import { SDKFrame } from "../../components/SDKFrame.jsx";
import { OrganizationSCIMWrapper } from "../../sdk/index.jsx";
import { mockData } from "../../services/mockData.js";

export function Scim() {
  return (
    <>
      <SDKFrame name="OrganizationSCIM" props={{ orgId: mockData.org.id }}>
        <OrganizationSCIMWrapper
          onSuccess={(d) => console.log("SCIM widget success:", d)}
          onError={(e) => console.error("SCIM widget error:", e)}
          fallback={<ScimMock />}
        />
      </SDKFrame>
    </>
  );
}

function ScimMock() {
  return (
    <div className="card">
      <EmptyState
        icon={<I.Sync />}
        title="SCIM is not configured"
        body="Enable SCIM 2.0 to provision and de-provision users from Okta, Azure AD, OneLogin, or any SCIM-compliant IdP. Avoid manual user management entirely."
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            marginTop: 10,
            color: "var(--text-3)",
            fontSize: 13,
          }}
        >
          <div className="row">
            <div className="empty-icon" style={{ width: 40, height: 40, borderRadius: 10 }}>
              <I.Globe />
            </div>
            <div>Your IdP</div>
          </div>
          <div
            style={{
              flex: 1,
              height: 1,
              background: "var(--border)",
              minWidth: 40,
              position: "relative",
            }}
          >
            <I.Sync
              style={{
                position: "absolute",
                top: -8,
                left: "50%",
                transform: "translateX(-50%)",
                background: "var(--bg)",
                padding: 2,
                color: "var(--primary)",
              }}
            />
          </div>
          <div className="row">
            <div className="empty-icon" style={{ width: 40, height: 40, borderRadius: 10 }}>
              <I.Helix />
            </div>
            <div>Helix workspace</div>
          </div>
        </div>
        <div className="empty-actions" style={{ marginTop: 20 }}>
          <button className="btn btn-secondary"><I.Book /> Read SCIM guide</button>
          <button className="btn btn-primary"><I.Plus /> Generate SCIM token</button>
        </div>
      </EmptyState>
    </div>
  );
}
