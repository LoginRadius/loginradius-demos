// Static stand-ins rendered when NEXT_PUBLIC_USE_SDK=false or a widget fails to mount.
// They keep the page's shape so the BBC chrome can be reviewed without a live
// tenant, and they never claim data they don't have.

export function Rows({ rows }) {
  return (
    <div>
      {rows.map(([label, value]) => (
        <div className="read-row" key={label}>
          <div className="read-row-label">{label}</div>
          <div className="read-row-value">{value}</div>
          <div />
        </div>
      ))}
    </div>
  );
}

export function Note({ children }) {
  return (
    <p style={{ color: "var(--bbc-ink-3)", fontSize: 14, margin: "12px 0" }}>
      {children}
    </p>
  );
}
