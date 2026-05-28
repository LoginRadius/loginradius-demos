import { useEffect, useState } from "react";
import { I } from "../../components/Icons.jsx";
import { PageHeader } from "../../components/UI.jsx";
import { SDKFrame } from "../../components/SDKFrame.jsx";
import { userService } from "../../services/userService.js";
import { mockData } from "../../services/mockData.js";
import { contactService } from "../../services/contactService.js";
import { dealService } from "../../services/dealService.js";

export function Dashboard() {
  const [activity, setActivity] = useState([]);
  const [crmStats, setCrmStats] = useState(null);

  useEffect(() => {
    userService.activity && setActivity(userService.activity());
    setCrmStats({ contacts: contactService.stats(), pipeline: dealService.pipeline() });
  }, []);

  const pipeline = crmStats?.pipeline;
  const stats = [
    { label: "Total contacts", value: crmStats ? crmStats.contacts.total : "—", trend: `${crmStats?.contacts.leads ?? 0} new leads`, dir: "up" },
    { label: "Active deals", value: pipeline ? pipeline.total : "—", trend: pipeline ? `$${Math.round(pipeline.value / 1000)}k pipeline` : "—", dir: "up" },
    { label: "Team members", value: 9, trend: "+2 this week", dir: "flat" },
    { label: "Integrations", value: 2, trend: "Google · SAML", dir: "flat" },
  ];

  return (
    <>
      <PageHeader title="Dashboard" sub="Your workspace overview and pipeline at a glance." />

      <SDKFrame name="OrganizationSummary" props={{ orgId: mockData.org.id }}>
        <div className="stat-grid">
          {stats.map((s) => (
            <div className="stat" key={s.label}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className={`stat-trend ${s.dir}`}>
                {s.dir === "up" && <I.TrendUp />}
                {s.trend}
              </div>
            </div>
          ))}
        </div>
      </SDKFrame>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginTop: 24 }}>
        <SDKFrame name="RecentActivity" props={{ orgId: mockData.org.id, limit: 6 }}>
          <div className="card">
            <div className="card-head">
              <div>
                <h3 className="card-title">Recent activity</h3>
                <p className="card-sub">Audit events across the workspace</p>
              </div>
              <button className="btn btn-ghost btn-sm">View all <I.ExternalLink /></button>
            </div>
            <div className="card-body flush">
              {(activity.length ? activity : mockData.activity).slice(0, 6).map((a, i) => (
                <div className="activity-item" key={i}>
                  <div className={`activity-dot ${a.tone}`}>
                    {a.tone === "green" && <I.Check />}
                    {a.tone === "blue" && <I.Users />}
                    {a.tone === "amber" && <I.Key />}
                    {a.tone === "red" && <I.Alert />}
                  </div>
                  <div className="activity-body">
                    <div>
                      <span className="who">{a.who}</span>{" "}
                      <span className="muted">{a.what}</span> {a.target}
                    </div>
                    <div className="when">{a.ago}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SDKFrame>

        <div className="col">
          <SDKFrame name="SecurityHealthCard" props={{ orgId: mockData.org.id }}>
            <div className="card">
              <div className="card-head">
                <div>
                  <h3 className="card-title">Security posture</h3>
                  <p className="card-sub">Based on members, policies & SSO</p>
                </div>
                <span className="badge badge-green"><span className="dot" />Good</span>
              </div>
              <div className="card-body">
                <div className="health">
                  <div className="health-track">
                    <div className="health-fill" style={{ width: "78%" }} />
                  </div>
                  <div className="health-num">78</div>
                </div>
                <ul className="checklist" style={{ marginTop: 12 }}>
                  <li><span className="check-icon done"><I.Check /></span>MFA enforced for admins</li>
                  <li><span className="check-icon done"><I.Check /></span>Session timeout configured</li>
                  <li><span className="check-icon todo" />Enforce MFA for all members</li>
                  <li><span className="check-icon todo" />Add a backup owner</li>
                </ul>
              </div>
            </div>
          </SDKFrame>

          <SDKFrame name="QuickActions" props={{ orgId: mockData.org.id }}>
            <div className="card">
              <div className="card-head">
                <h3 className="card-title">Quick actions</h3>
              </div>
              <div className="card-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <button className="btn btn-secondary" style={{ justifyContent: "flex-start" }}><I.Contact /> Add contact</button>
                <button className="btn btn-secondary" style={{ justifyContent: "flex-start" }}><I.Briefcase /> New deal</button>
                <button className="btn btn-secondary" style={{ justifyContent: "flex-start" }}><I.Mail /> Invite member</button>
                <button className="btn btn-secondary" style={{ justifyContent: "flex-start" }}><I.Plug /> Add integration</button>
              </div>
            </div>
          </SDKFrame>
        </div>
      </div>
    </>
  );
}
