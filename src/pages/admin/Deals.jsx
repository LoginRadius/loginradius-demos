import { useEffect, useState } from "react";
import { I } from "../../components/Icons.jsx";
import { LoadingState, PageHeader } from "../../components/UI.jsx";
import { dealService, STAGES } from "../../services/dealService.js";

const PIPELINE_STAGES = STAGES.slice(0, 4);

const stageColor = {
  Prospect: "#94a3b8",
  Qualified: "#3b82f6",
  Proposal: "#f59e0b",
  Negotiation: "#8b5cf6",
  "Closed Won": "#16a34a",
  "Closed Lost": "#dc2626",
};

function fmt(n) {
  return n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
}

export function Deals() {
  const [deals, setDeals] = useState(null);
  const [view, setView] = useState("board");

  useEffect(() => {
    dealService.list().then(setDeals);
  }, []);

  if (deals === null) return <div className="card"><LoadingState label="Loading deals…" /></div>;

  const pipeline = dealService.pipeline();

  return (
    <>
      <PageHeader
        title="Deals"
        sub="Track your pipeline and manage opportunities from prospect to close."
        actions={<button className="btn btn-primary"><I.Plus /> Add deal</button>}
      />

      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat">
          <div className="stat-label">Active deals</div>
          <div className="stat-value">{pipeline.total}</div>
          <div className="stat-trend flat">Across 4 stages</div>
        </div>
        <div className="stat">
          <div className="stat-label">Pipeline value</div>
          <div className="stat-value">{fmt(pipeline.value)}</div>
          <div className="stat-trend up"><I.TrendUp /> Total open</div>
        </div>
        <div className="stat">
          <div className="stat-label">Weighted forecast</div>
          <div className="stat-value">{fmt(Math.round(pipeline.weighted))}</div>
          <div className="stat-trend flat">Probability-adjusted</div>
        </div>
        <div className="stat">
          <div className="stat-label">Avg. deal size</div>
          <div className="stat-value">{pipeline.total ? fmt(Math.round(pipeline.value / pipeline.total)) : "—"}</div>
          <div className="stat-trend flat">Active deals only</div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h3 className="card-title">Deals pipeline</h3>
            <p className="card-sub">{deals.filter((d) => d.stage !== "Closed Lost" && d.stage !== "Closed Won").length} open deals</p>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <div className="row" style={{ gap: 0, border: "1px solid var(--border-1)", borderRadius: 6, overflow: "hidden" }}>
              <button
                className={`btn btn-sm ${view === "board" ? "btn-secondary" : "btn-ghost"}`}
                style={{ borderRadius: 0 }}
                onClick={() => setView("board")}
              >Board</button>
              <button
                className={`btn btn-sm ${view === "list" ? "btn-secondary" : "btn-ghost"}`}
                style={{ borderRadius: 0 }}
                onClick={() => setView("list")}
              >List</button>
            </div>
            <button className="btn btn-primary btn-sm"><I.Plus /> Add deal</button>
          </div>
        </div>

        {view === "board" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, padding: "0 16px 16px" }}>
            {PIPELINE_STAGES.map((stage) => {
              const stageDeals = deals.filter((d) => d.stage === stage);
              return (
                <div key={stage} style={{ background: "var(--bg-2)", borderRadius: 8, padding: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: stageColor[stage], textTransform: "uppercase", letterSpacing: "0.05em" }}>{stage}</span>
                    <span className="badge badge-slate" style={{ fontSize: 10 }}>{stageDeals.length}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {stageDeals.length === 0 && (
                      <div style={{ fontSize: 12, color: "var(--text-3)", textAlign: "center", padding: "12px 0" }}>No deals</div>
                    )}
                    {stageDeals.map((d) => (
                      <div key={d.id} className="card" style={{ margin: 0, padding: 10, cursor: "pointer" }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-1)", marginBottom: 4, lineHeight: 1.3 }}>{d.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 8 }}>{d.company}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{fmt(d.value)}</span>
                          <div className="avatar" style={{ width: 18, height: 18, fontSize: 9, background: d.ownerColor }}>{d.ownerInitials}</div>
                        </div>
                        <div style={{ marginTop: 6, fontSize: 10, color: "var(--text-3)" }}>Close {d.closeDate}</div>
                        <div style={{ marginTop: 6, background: "var(--bg-3)", borderRadius: 4, height: 3 }}>
                          <div style={{ background: stageColor[stage], height: 3, borderRadius: 4, width: `${d.probability}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Deal</th>
                <th>Stage</th>
                <th>Value</th>
                <th>Probability</th>
                <th>Owner</th>
                <th>Close date</th>
                <th className="col-actions" />
              </tr>
            </thead>
            <tbody>
              {deals.map((d) => (
                <tr key={d.id}>
                  <td>
                    <div>
                      <div className="name">{d.name}</div>
                      <div className="email">{d.contact} · {d.company}</div>
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{ background: `${stageColor[d.stage]}22`, color: stageColor[d.stage], border: `1px solid ${stageColor[d.stage]}44` }}>
                      {d.stage}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{fmt(d.value)}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ background: "var(--bg-3)", borderRadius: 4, height: 4, width: 60, flexShrink: 0 }}>
                        <div style={{ background: stageColor[d.stage], height: 4, borderRadius: 4, width: `${d.probability}%` }} />
                      </div>
                      <span style={{ fontSize: 12 }}>{d.probability}%</span>
                    </div>
                  </td>
                  <td>
                    <div className="row" style={{ gap: 6, alignItems: "center" }}>
                      <div className="avatar" style={{ width: 20, height: 20, fontSize: 9, background: d.ownerColor }}>{d.ownerInitials}</div>
                      <span style={{ fontSize: 12 }}>{d.owner}</span>
                    </div>
                  </td>
                  <td className="muted">{d.closeDate}</td>
                  <td className="col-actions"><button className="icon-btn"><I.More /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
