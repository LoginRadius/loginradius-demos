import { I } from "../../components/Icons.jsx";
import { PageHeader } from "../../components/UI.jsx";

const MONTHLY = [
  { month: "Dec", value: 28 },
  { month: "Jan", value: 34 },
  { month: "Feb", value: 29 },
  { month: "Mar", value: 45 },
  { month: "Apr", value: 52 },
  { month: "May", value: 61 },
];

const PIPELINE_DIST = [
  { stage: "Prospect", count: 1, value: 19200, color: "#94a3b8" },
  { stage: "Qualified", count: 2, value: 27600, color: "#3b82f6" },
  { stage: "Proposal", count: 2, value: 104000, color: "#f59e0b" },
  { stage: "Negotiation", count: 1, value: 32000, color: "#8b5cf6" },
];

const total_pipeline = PIPELINE_DIST.reduce((s, d) => s + d.value, 0);

function SparkBar({ data, color = "var(--primary)" }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60 }}>
      {data.map((d) => (
        <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ width: "100%", background: color, borderRadius: "3px 3px 0 0", height: `${(d.value / max) * 52}px`, opacity: 0.85 }} />
          <span style={{ fontSize: 10, color: "var(--text-3)" }}>{d.month}</span>
        </div>
      ))}
    </div>
  );
}

export function Reports() {
  return (
    <>
      <PageHeader
        title="Reports"
        sub="Revenue, pipeline, and team performance across your workspace."
        actions={<button className="btn btn-secondary"><I.Download /> Export</button>}
      />

      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat">
          <div className="stat-label">Monthly recurring revenue</div>
          <div className="stat-value">$61k</div>
          <div className="stat-trend up"><I.TrendUp /> +17% vs last month</div>
        </div>
        <div className="stat">
          <div className="stat-label">Deals closed (MTD)</div>
          <div className="stat-value">3</div>
          <div className="stat-trend up"><I.TrendUp /> $90k won</div>
        </div>
        <div className="stat">
          <div className="stat-label">Win rate</div>
          <div className="stat-value">62%</div>
          <div className="stat-trend flat">Last 90 days</div>
        </div>
        <div className="stat">
          <div className="stat-label">Avg. sales cycle</div>
          <div className="stat-value">38d</div>
          <div className="stat-trend flat">-4d vs last quarter</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <h3 className="card-title">Revenue trend</h3>
              <p className="card-sub">Monthly closed revenue (last 6 months)</p>
            </div>
          </div>
          <div className="card-body">
            <SparkBar data={MONTHLY} color="var(--primary)" />
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h3 className="card-title">Pipeline distribution</h3>
              <p className="card-sub">Value by stage</p>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PIPELINE_DIST.map((d) => (
                <div key={d.stage}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                    <span style={{ color: "var(--text-2)" }}>{d.stage}</span>
                    <span style={{ fontWeight: 600 }}>${(d.value / 1000).toFixed(0)}k</span>
                  </div>
                  <div style={{ background: "var(--bg-3)", borderRadius: 4, height: 6 }}>
                    <div style={{ background: d.color, height: 6, borderRadius: 4, width: `${(d.value / total_pipeline) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h3 className="card-title">Team performance</h3>
              <p className="card-sub">Deals owned by rep</p>
            </div>
          </div>
          <div className="card-body">
            <table className="tbl" style={{ marginTop: 0 }}>
              <thead>
                <tr>
                  <th>Rep</th>
                  <th>Open</th>
                  <th>Closed won</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="row" style={{ gap: 8 }}>
                      <div className="avatar" style={{ width: 22, height: 22, fontSize: 10, background: "#1E5DDB" }}>AC</div>
                      <span>Aria Chen</span>
                    </div>
                  </td>
                  <td>3</td>
                  <td><span className="badge badge-green">1 won</span></td>
                  <td style={{ fontWeight: 600 }}>$139k</td>
                </tr>
                <tr>
                  <td>
                    <div className="row" style={{ gap: 8 }}>
                      <div className="avatar" style={{ width: 22, height: 22, fontSize: 10, background: "#7c3aed" }}>MW</div>
                      <span>Marcus Wong</span>
                    </div>
                  </td>
                  <td>2</td>
                  <td><span className="badge badge-slate">0 won</span></td>
                  <td style={{ fontWeight: 600 }}>$88k</td>
                </tr>
                <tr>
                  <td>
                    <div className="row" style={{ gap: 8 }}>
                      <div className="avatar" style={{ width: 22, height: 22, fontSize: 10, background: "#db2777" }}>PS</div>
                      <span>Priya Sharma</span>
                    </div>
                  </td>
                  <td>2</td>
                  <td><span className="badge badge-slate">0 won</span></td>
                  <td style={{ fontWeight: 600 }}>$29k</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h3 className="card-title">Contact acquisition</h3>
              <p className="card-sub">New contacts this quarter</p>
            </div>
          </div>
          <div className="card-body">
            <SparkBar data={MONTHLY} color="#8b5cf6" />
            <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
              <div style={{ flex: 1, background: "var(--bg-2)", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>10</div>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>Total contacts</div>
              </div>
              <div style={{ flex: 1, background: "var(--bg-2)", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>3</div>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>New leads</div>
              </div>
              <div style={{ flex: 1, background: "var(--bg-2)", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>5</div>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>Active</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
