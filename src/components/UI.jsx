import { I } from "./Icons.jsx";

export function PageHeader({ title, sub, actions }) {
  return (
    <div className="page-head">
      <div>
        <h1 className="page-title">{title}</h1>
        {sub && <p className="page-sub">{sub}</p>}
      </div>
      {actions && <div className="row" style={{ gap: 8 }}>{actions}</div>}
    </div>
  );
}

const STATUS_MAP = {
  active: { cls: "badge-green", label: "Active" },
  invited: { cls: "badge-amber", label: "Invited" },
  suspended: { cls: "badge-slate", label: "Suspended" },
  expired: { cls: "badge-slate", label: "Invite expired" },
  pending: { cls: "badge-amber", label: "Pending" },
  accepted: { cls: "badge-green", label: "Accepted" },
  verified: { cls: "badge-green", label: "Verified" },
  lead: { cls: "badge-blue", label: "Lead" },
  inactive: { cls: "badge-slate", label: "Inactive" },
};

export function StatusBadge({ status }) {
  const m = STATUS_MAP[status] || { cls: "badge-slate", label: status };
  return (
    <span className={`badge ${m.cls}`}>
      <span className="dot" />
      {m.label}
    </span>
  );
}

export function EmptyState({ icon, title, body, children }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{body}</p>
      {children}
    </div>
  );
}

export function TableToolbar({ search, setSearch, placeholder, filters, actions }) {
  return (
    <div className="tbl-toolbar">
      <div className="searchbar" style={{ width: 260 }}>
        <I.Search />
        <input
          placeholder={placeholder}
          value={search || ""}
          onChange={(e) => setSearch && setSearch(e.target.value)}
        />
      </div>
      {filters &&
        filters.map((f, i) => (
          <button
            key={i}
            className={`filter-chip ${f.active ? "active" : ""}`}
            onClick={f.onClick}
          >
            {f.label}
            {f.value ? <span>: {f.value}</span> : <I.Plus />}
          </button>
        ))}
      <div className="spacer" />
      {actions}
    </div>
  );
}

export function ToggleRow({ title, body, value, onChange }) {
  return (
    <div className="toggle-row">
      <div className="label">
        <h5>{title}</h5>
        <p>{body}</p>
      </div>
      <div
        role="switch"
        aria-checked={value}
        tabIndex={0}
        className={`toggle ${value ? "on" : ""}`}
        onClick={() => onChange(!value)}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            onChange(!value);
          }
        }}
      />
    </div>
  );
}

export function LoadingState({ label = "Loading…" }) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <I.Refresh />
      </div>
      <h3>{label}</h3>
      <p>Fetching data from the server.</p>
    </div>
  );
}
