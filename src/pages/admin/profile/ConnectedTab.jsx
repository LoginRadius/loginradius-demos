import { SDKCard } from "./SDKCard.jsx";
import { SocialProviderWrapper } from "../../../sdk/profile/index.jsx";
import { LinkAccount } from "@loginradius/loginradius-react";

const PROVIDERS = [
  { name: "Google", color: "#4285F4", connected: true, meta: "aria.chen@northwind.io · connected Mar 14, 2026" },
  { name: "Microsoft", color: "#5E5E5E", connected: true, meta: "aria@outlook.com · connected Apr 02, 2026" },
  { name: "GitHub", color: "#24292e", connected: false, meta: "Use to sign in or link your contributions" },
  { name: "Okta", color: "#007DC1", connected: false, meta: "Enterprise SSO via Northwind workspace" },
];

function ProviderBadge({ name, color }) {
  return (
    <div
      className="contact-icon"
      style={{
        background: color,
        color: "white",
        fontWeight: 600,
        fontSize: 13,
        fontFamily: "var(--font-sans)",
      }}
    >
      {name.charAt(0)}
    </div>
  );
}

function SocialMock() {
  return (
    <div className="card-body flush" style={{ padding: 0 }}>
      {PROVIDERS.map((p) => (
        <div className="contact-row" key={p.name}>
          <ProviderBadge name={p.name} color={p.color} />
          <div className="contact-meta">
            <div className="contact-value">{p.name}</div>
            <div className="contact-sub">{p.meta}</div>
          </div>
          {p.connected ? (
            <span className="badge badge-green">
              <span className="dot" />
              Connected
            </span>
          ) : (
            <span className="badge badge-slate">
              <span className="dot" />
              Not connected
            </span>
          )}
          {p.connected ? (
            <button className="btn btn-ghost btn-sm" type="button">Disconnect</button>
          ) : (
            <button className="btn btn-secondary btn-sm" type="button">Connect</button>
          )}
        </div>
      ))}
    </div>
  );
}

export function ConnectedTab({ onSuccess, onError }) {
  return (
    <div className="col" style={{ gap: 16 }}>
      <LinkAccount embedded />
    </div>
  );
}
