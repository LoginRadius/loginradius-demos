import { I } from "../../components/Icons.jsx";
import { EmptyState } from "../../components/UI.jsx";
import { SDKFrame } from "../../components/SDKFrame.jsx";
import { ProviderLogo } from "../../components/ProviderLogo.jsx";
import { OrganizationConnectionsWrapper } from "../../sdk/index.jsx";
import { mockData } from "../../services/mockData.js";

const PROVIDERS = ["Google", "Microsoft", "Okta", "SAML", "OIDC", "GitHub", "JumpCloud", "PingId"];

export function Connections() {
  return (
    <>
      <SDKFrame name="OrganizationConnections" props={{ orgId: mockData.org.id }}>
        <OrganizationConnectionsWrapper
          onSuccess={(d) => console.log("Connections widget success:", d)}
          onError={(e) => console.error("Connections widget error:", e)}
          fallback={<ConnectionsMock />}
        />
      </SDKFrame>
    </>
  );
}

function ConnectionsMock() {
  return (
    <div className="card">
      <EmptyState
        icon={<I.Plug />}
        title="Connect an identity provider"
        body="Let your members sign in using your existing IdP. We support OIDC, SAML 2.0, and OAuth providers."
      >
        <div className="provider-grid">
          {PROVIDERS.map((p) => (
            <div className="provider-card" key={p}>
              <ProviderLogo name={p} />
              <div className="provider-name">{p}</div>
            </div>
          ))}
        </div>
        <div className="empty-actions" style={{ marginTop: 16 }}>
          <button className="btn btn-secondary"><I.Book /> Setup guide</button>
          <button className="btn btn-primary"><I.Plus /> Custom SAML</button>
        </div>
      </EmptyState>
    </div>
  );
}
