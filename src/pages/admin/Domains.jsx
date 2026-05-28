import { useEffect, useState } from "react";
import { I } from "../../components/Icons.jsx";
import { EmptyState, LoadingState, StatusBadge } from "../../components/UI.jsx";
import { SDKFrame } from "../../components/SDKFrame.jsx";
import { OrganizationDomainManagementWrapper } from "../../sdk/index.jsx";
import { userService } from "../../services/userService.js";
import { mockData } from "../../services/mockData.js";

export function Domains() {
  return (
    <>
      <SDKFrame name="OrganizationDomainManagement" props={{ orgId: mockData.org.id }}>
        <OrganizationDomainManagementWrapper
          onSuccess={(d) => console.log("Domains widget success:", d)}
          onError={(e) => console.error("Domains widget error:", e)}
          fallback={<DomainsMock />}
        />
      </SDKFrame>
    </>
  );
}

function DomainsMock() {
  const [domains, setDomains] = useState(null);

  useEffect(() => {
    userService.listDomains().then(setDomains);
  }, []);

  if (domains === null) return <div className="card"><LoadingState label="Loading domains…" /></div>;

  return (
    <>
      <div className="card">
        <div className="card-head">
          <div>
            <h3 className="card-title">Verified domains</h3>
            <p className="card-sub">Members joining from these domains can be auto-routed to your workspace.</p>
          </div>
        </div>
        {domains.length === 0 ? (
          <EmptyState
            icon={<I.Globe />}
            title="No domains added"
            body="Add and verify a domain to enable SSO and auto-provisioning."
          >
            <button className="btn btn-primary"><I.Plus /> Add your first domain</button>
          </EmptyState>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Domain</th>
                <th>Status</th>
                <th>Verified</th>
                <th>Auto-join</th>
                <th>SSO enforced</th>
                <th className="col-actions" />
              </tr>
            </thead>
            <tbody>
              {domains.map((d) => (
                <tr key={d.domain}>
                  <td>
                    <div className="row">
                      <span className="domain-name">{d.domain}</span>
                      {d.primary && <span className="badge badge-blue">Primary</span>}
                    </div>
                  </td>
                  <td><StatusBadge status={d.status} /></td>
                  <td className="muted">{d.verifiedAt}</td>
                  <td>
                    {d.autoJoin ? (
                      <span className="badge badge-green"><span className="dot" />On</span>
                    ) : (
                      <span className="badge badge-slate"><span className="dot" />Off</span>
                    )}
                  </td>
                  <td>
                    {d.ssoEnforced ? (
                      <span className="badge badge-green"><span className="dot" />Required</span>
                    ) : (
                      <span className="badge badge-slate"><span className="dot" />Optional</span>
                    )}
                  </td>
                  <td className="col-actions"><button className="icon-btn"><I.More /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {domains.some((d) => d.status === "pending") && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-head">
            <div>
              <h3 className="card-title">Pending verification — northwind-eu.com</h3>
              <p className="card-sub">Add this TXT record to your DNS provider. We'll re-check every 5 minutes.</p>
            </div>
            <button className="btn btn-secondary btn-sm"><I.Refresh /> Re-check now</button>
          </div>
          <div className="card-body">
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 80px", gap: 12, fontSize: 13 }}>
              <div className="muted">Type</div>
              <div className="mono">TXT</div>
              <div />
              <div className="muted">Host</div>
              <div className="mono">@</div>
              <div />
              <div className="muted">Value</div>
              <div className="mono" style={{ wordBreak: "break-all" }}>
                helix-domain-verify=org_01HZX9P4KQYG8WJTVH3M2N1.7a3fce…
              </div>
              <button className="btn btn-ghost btn-sm" style={{ justifySelf: "end" }}>
                <I.Copy /> Copy
              </button>
              <div className="muted">TTL</div>
              <div className="mono">3600</div>
              <div />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
