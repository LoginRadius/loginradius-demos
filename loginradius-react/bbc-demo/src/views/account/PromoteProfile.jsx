"use client";

import { useState } from "react";
import { I } from "../../components/Icons.jsx";

// Promote a viewing profile into a standalone child account, then hand the
// credentials to the parent once.
//
// The password exists in component state and nowhere else: not localStorage,
// not sessionStorage, not the URL, and not in any log. Dismissing the handoff
// screen drops it, and it cannot be retrieved again — only reset.
export function PromoteProfile({ profiles, accessToken, onLinked }) {
  const [open, setOpen] = useState(false);
  const [issued, setIssued] = useState(null);

  if (issued) {
    return (
      <CredentialsHandoff
        credentials={issued}
        onDone={() => {
          setIssued(null);
          setOpen(false);
        }}
      />
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => setOpen(true)}
        disabled={profiles.length === 0}
        title={
          profiles.length === 0
            ? "Create a viewing profile first"
            : undefined
        }
      >
        Link a standalone account
      </button>
    );
  }

  return (
    <PromoteForm
      profiles={profiles}
      accessToken={accessToken}
      onCancel={() => setOpen(false)}
      onLinked={(result) => {
        // Keep the password only in memory, only until dismissed.
        setIssued({ email: result.email, password: result.password });
        onLinked?.(result.graph);
      }}
    />
  );
}

function PromoteForm({ profiles, accessToken, onCancel, onLinked }) {
  const [values, setValues] = useState({
    profileId: profiles[0]?.id ?? "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [field, setField] = useState(null);

  const set = (key) => (e) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setField(null);
    try {
      const res = await fetch("/api/linked-accounts/create-child", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(values),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setField(body?.field ?? null);
        throw new Error(body?.error || `Request failed (${res.status})`);
      }
      // The server never echoes the password back; it is what the parent typed.
      onLinked({ ...body, password: values.password });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form className="profile-form" onSubmit={submit}>
      <div className="profile-form-row">
        <label htmlFor="cp-profile">Which profile is this for?</label>
        <select id="cp-profile" value={values.profileId} onChange={set("profileId")} required>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.displayName}
            </option>
          ))}
        </select>
      </div>

      <div className="profile-form-row">
        <label htmlFor="cp-email">Child&apos;s email address</label>
        <input
          id="cp-email"
          type="email"
          value={values.email}
          onChange={set("email")}
          placeholder="you+jamie@example.com"
          required
          autoComplete="off"
        />
        <p className="field-hint">
          No separate mailbox? Use a sub-address of your own, like
          {" "}<code>you+jamie@example.com</code>.
        </p>
      </div>

      <div className="profile-form-row">
        <label htmlFor="cp-pw">Password for the child</label>
        <input
          id="cp-pw"
          type="password"
          value={values.password}
          onChange={set("password")}
          minLength={8}
          required
          autoComplete="new-password"
        />
      </div>

      <div className="profile-form-row">
        <label htmlFor="cp-pw2">Confirm password</label>
        <input
          id="cp-pw2"
          type="password"
          value={values.confirmPassword}
          onChange={set("confirmPassword")}
          required
          autoComplete="new-password"
        />
      </div>

      {error && (
        <div className="notice" style={{ marginTop: 4 }}>
          <I.Alert width={18} height={18} />
          <div>
            {error}
            {field && <div style={{ marginTop: 2, fontSize: 13 }}>Check the {field} field.</div>}
          </div>
        </div>
      )}

      <div className="profile-form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={
            saving ||
            !values.email.trim() ||
            values.password.length < 8 ||
            values.password !== values.confirmPassword
          }
        >
          {saving ? "Creating account…" : "Create child account"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function CredentialsHandoff({ credentials, onDone }) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const copy = async () => {
    const text = `Email: ${credentials.email}\nPassword: ${credentials.password}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setCopyFailed(false);
    } catch {
      // Clipboard access needs a secure context and can be denied outright.
      // The values are on screen, so the parent can still transcribe them.
      setCopyFailed(true);
    }
  };

  return (
    <div className="handoff">
      <div className="notice" style={{ marginBottom: 16 }}>
        <I.Alert width={18} height={18} />
        <div>
          <strong>Copy these details now.</strong> The password is shown once and
          can&apos;t be retrieved afterwards — only reset.
        </div>
      </div>

      <dl className="handoff-fields">
        <dt>Email</dt>
        <dd>{credentials.email}</dd>
        <dt>Password</dt>
        <dd className="handoff-secret">{credentials.password}</dd>
      </dl>

      <div className="profile-form-actions">
        <button type="button" className="btn btn-primary" onClick={copy}>
          {copied ? "Copied ✓" : "Copy email & password"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onDone}>
          Done
        </button>
      </div>

      {copyFailed && (
        <p className="field-hint" style={{ marginTop: 10 }}>
          Couldn&apos;t reach the clipboard — copy the details above by hand.
        </p>
      )}
    </div>
  );
}
