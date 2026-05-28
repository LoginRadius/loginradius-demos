import { useEffect, useRef, useState } from "react";
import { I } from "./Icons.jsx";

export function OrgSwitcher({ orgs, current, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (!current) return null;

  return (
    <div className="org-switch" onClick={() => setOpen((o) => !o)} ref={ref}>
      <div
        className="org-avatar"
        style={{ background: `linear-gradient(135deg, ${current.color}, ${current.color}cc)` }}
      >
        {current?.name?.charAt(0)}
      </div>
      <div className="org-meta">
        <div className="org-name">{current.name}</div>
        <div className="org-plan">{current.plan} plan</div>
      </div>
      <I.ChevUpDown className="org-chev" />
      {open && (
        <div className="org-popover" onClick={(e) => e.stopPropagation()}>
          <h6>Workspaces</h6>
          {orgs.map((o) => (
            <div
              key={o.id}
              className={`org-option ${o.id === current.id ? "current" : ""}`}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
            >
              <div
                className="org-avatar"
                style={{ background: `linear-gradient(135deg, ${o.color}, ${o.color}cc)` }}
              >
                {o?.name?.charAt(0)}
              </div>
              <div>
                <div className="org-name">{o.name}</div>
                <div className="org-plan">{o.plan}</div>
              </div>
              {o.id === current.id && <I.Check className="check" />}
            </div>
          ))}
          <hr />
          <div className="new-org" onClick={() => setOpen(false)}>
            <I.Plus /> Create new workspace
          </div>
        </div>
      )}
    </div>
  );
}
