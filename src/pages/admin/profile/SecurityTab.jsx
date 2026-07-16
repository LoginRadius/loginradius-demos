import { useState } from "react";
import { I } from "../../../components/Icons.jsx";
import { PI } from "./ProfileIcons.jsx";
import { SetupTwoFactorAuth } from "@loginradius/loginradius-react";
import { ChangePassword } from "@loginradius/loginradius-react";
import { AddPasskey } from "@loginradius/loginradius-react";
import { ChangePIN } from "@loginradius/loginradius-react";

function ReadRow({ label, value, mono }) {
  return (
    <div className="read-row">
      <div className="read-row-label">{label}</div>
      <div className={`read-row-value ${mono ? "mono" : ""}`}>{value}</div>
      <div />
    </div>
  );
}

function PasswordMock() {
  return (
    <div className="card-body flush" style={{ padding: 0 }}>
      <ReadRow label="Current password" value="••••••••••••" mono />
      <ReadRow label="Last changed" value="Mar 14, 2026 · 47 days ago" />
      <ReadRow
        label="Strength"
        value={
          <div className="strength">
            <div className="strength-bar">
              <div className="strength-fill" style={{ width: "82%" }} />
            </div>
            <span style={{ color: "var(--green)", fontSize: 12.5, fontWeight: 500 }}>Strong</span>
          </div>
        }
      />
    </div>
  );
}

function MFAMock() {
  return (
    <div className="card-body flush" style={{ padding: 0 }}>
      <div className="method-row">
        <div className="method-icon"><I.Lock /></div>
        <div className="method-meta">
          <div className="method-name">Authenticator app</div>
          <div className="method-sub">1Password · Added Mar 12, 2026 · Used 2 hours ago</div>
        </div>
        <span className="badge badge-blue">Primary</span>
        <button className="btn btn-ghost btn-sm" type="button">Replace</button>
      </div>
      <div className="method-row">
        <div className="method-icon"><PI.Phone /></div>
        <div className="method-meta">
          <div className="method-name">SMS to +1 (415) ••• ••42</div>
          <div className="method-sub">Backup factor · Last used Jan 4, 2026</div>
        </div>
        <button className="btn btn-ghost btn-sm" type="button">Remove</button>
      </div>
      <div className="method-row method-add">
        <div className="method-icon-add"><I.Plus /></div>
        <div className="method-meta">
          <div className="method-name">Add a backup factor</div>
          <div className="method-sub">Recovery codes, hardware key, or another device.</div>
        </div>
        <button className="btn btn-secondary btn-sm" type="button">Add</button>
      </div>
    </div>
  );
}

function PasskeyMock() {
  return (
    <div className="card-body flush" style={{ padding: 0 }}>
      <div className="method-row">
        <div className="method-icon"><PI.Finger /></div>
        <div className="method-meta">
          <div className="method-name">MacBook Pro · Touch ID</div>
          <div className="method-sub">Synced via iCloud Keychain · Added Apr 02, 2026 · Last used today</div>
        </div>
        <button className="btn btn-ghost btn-sm" type="button">Rename</button>
        <button className="btn btn-ghost btn-sm" type="button" style={{ color: "var(--red)" }}>Remove</button>
      </div>
      <div className="method-row">
        <div className="method-icon"><PI.Smartphone /></div>
        <div className="method-meta">
          <div className="method-name">iPhone 15 Pro · Face ID</div>
          <div className="method-sub">Synced via iCloud Keychain · Added Apr 02, 2026 · Last used yesterday</div>
        </div>
        <button className="btn btn-ghost btn-sm" type="button">Rename</button>
        <button className="btn btn-ghost btn-sm" type="button" style={{ color: "var(--red)" }}>Remove</button>
      </div>
    </div>
  );
}

function PinMock({ pinOn, setPinOn }) {
  return (
    <div className="pin-row">
      <div className="pin-display" aria-label="Six digit PIN">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`pin-dot ${pinOn ? "filled" : ""}`} />
        ))}
      </div>
      <div className="spacer" />
      {pinOn ? (
        <>
          <button className="btn btn-secondary btn-sm" type="button">Change PIN</button>
          <button
            className="btn btn-ghost btn-sm"
            type="button"
            style={{ color: "var(--red)" }}
            onClick={() => setPinOn(false)}
          >
            Remove
          </button>
        </>
      ) : (
        <button className="btn btn-primary btn-sm" type="button" onClick={() => setPinOn(true)}>
          <I.Plus /> Set up PIN
        </button>
      )}
    </div>
  );
}

export function SecurityTab({ onSuccess, onError }) {
  const [pinOn, setPinOn] = useState(false);

  return (
    <div className="col" style={{ gap: 16 }}>
      <ChangePassword
        embedded
        onSuccess={onSuccess}
        onError={onError}
        fallback={<PasswordMock />}
      />

      <SetupTwoFactorAuth
        embedded
        onSuccess={onSuccess}
        onError={onError}
        fallback={<MFAMock />}
      />

      <AddPasskey
        embedded
        onSuccess={onSuccess}
        onError={onError}
        fallback={<PasskeyMock />}
      />

      <ChangePIN
        embedded
        onSuccess={onSuccess}
        onError={onError}
        fallback={<PinMock pinOn={pinOn} setPinOn={setPinOn} />}
      />
    </div>
  );
}
