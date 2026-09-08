"use client";

import { useCallback, useEffect, useState } from "react";
import { I } from "../../components/Icons.jsx";

// Parent-facing administration of one linked child account: account telemetry
// plus a password reset, both served by /api/linked-accounts/child/[uid].
//
// Mirrors what the admin console offers support staff (AccountInfo's field
// list + UserActionPopup's reset form), scoped by the delegation gate so a
// parent only ever reaches their own child.

const fmt = (iso) =>
  iso ? new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—";

export function ManageChild({ child, accessToken, onClose }) {
  const [state, setState] = useState({ status: "loading", data: null, error: null });
  const [resetting, setResetting] = useState(false);

  const load = useCallback(
    async (signal) => {
      setState({ status: "loading", data: null, error: null });
      try {
        const res = await fetch(
          `/api/linked-accounts/child/${encodeURIComponent(child.uid)}`,
          { headers: { Authorization: `Bearer ${accessToken}` }, signal },
        );
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.error || `Request failed (${res.status})`);
        setState({ status: "ready", data: body, error: null });
      } catch (err) {
        if (err.name === "AbortError") return;
        setState({ status: "error", data: null, error: err.message });
      }
    },
    [child.uid, accessToken],
  );

  useEffect(() => {
    const c = new AbortController();
    load(c.signal);
    return () => c.abort();
  }, [load]);

  // Escape closes, matching the rest of the account chrome.
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mc-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2 id="mc-title">{child.displayName || "Child account"}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {state.status === "loading" && (
            <div className="linked-skel" style={{ width: "70%" }} />
          )}

          {state.status === "error" && (
            <div className="notice">
              <I.Alert width={18} height={18} />
              <div>
                {state.error}
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ marginTop: 12 }}
                  onClick={() => load()}
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {state.status === "ready" && (
            <>
              <dl className="detail-grid">
                <dt>Email</dt>
                <dd>
                  {state.data.email || "—"}{" "}
                  <span className={`tag ${state.data.emailVerified ? "tag-on" : ""}`}>
                    {state.data.emailVerified ? "Verified" : "Unverified"}
                  </span>
                </dd>
                <dt>Status</dt>
                <dd>
                  <span className={`tag ${state.data.isActive ? "tag-on" : "tag-danger"}`}>
                    {state.data.isActive ? "Active" : "Inactive"}
                  </span>
                </dd>
                <dt>Account type</dt>
                <dd>{state.data.accountType || "—"}</dd>
                <dt>Created</dt>
                <dd>{fmt(state.data.createdDate)}</dd>
                <dt>Last sign-in</dt>
                <dd>{fmt(state.data.lastLoginDate)}</dd>
                <dt>Password changed</dt>
                <dd>{fmt(state.data.lastPasswordChangeDate)}</dd>
                <dt>User ID</dt>
                <dd className="detail-mono">{state.data.uid}</dd>
              </dl>

              <div className="modal-section">
                <h3>Reset password</h3>
                <p className="field-hint" style={{ marginBottom: 10 }}>
                  Children can&apos;t reset their own password. Set a new one and
                  pass it on — it&apos;s shown once.
                </p>
                {resetting ? (
                  <ResetChildPassword
                    childUid={child.uid}
                    accessToken={accessToken}
                    onCancel={() => setResetting(false)}
                    onDone={() => {
                      setResetting(false);
                      load();
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setResetting(true)}
                  >
                    Set a new password
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ResetChildPassword({ childUid, accessToken, onCancel, onDone }) {
  const [values, setValues] = useState({ newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [issued, setIssued] = useState(null);
  const [copied, setCopied] = useState(false);

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/linked-accounts/child/${encodeURIComponent(childUid)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(values),
        },
      );
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || `Request failed (${res.status})`);
      // Held in state only, until this panel unmounts.
      setIssued(values.newPassword);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (issued) {
    return (
      <div>
        <div className="notice" style={{ marginBottom: 12 }}>
          <I.Alert width={18} height={18} />
          <div>
            <strong>Password updated.</strong> Copy it now — it won&apos;t be
            shown again.
          </div>
        </div>
        <p className="handoff-secret" style={{ display: "inline-block" }}>{issued}</p>
        <div className="profile-form-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(issued);
                setCopied(true);
              } catch {
                /* on screen either way */
              }
            }}
          >
            {copied ? "Copied ✓" : "Copy password"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onDone}>
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="profile-form" onSubmit={submit} style={{ borderBottom: 0 }}>
      <div className="profile-form-row">
        <label htmlFor="rc-pw">New password</label>
        <input
          id="rc-pw"
          type="password"
          value={values.newPassword}
          onChange={set("newPassword")}
          minLength={8}
          required
          autoComplete="new-password"
          autoFocus
        />
      </div>
      <div className="profile-form-row">
        <label htmlFor="rc-pw2">Confirm password</label>
        <input
          id="rc-pw2"
          type="password"
          value={values.confirmPassword}
          onChange={set("confirmPassword")}
          required
          autoComplete="new-password"
        />
      </div>

      {error && (
        <div className="notice">
          <I.Alert width={18} height={18} />
          <div>{error}</div>
        </div>
      )}

      <div className="profile-form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={
            saving ||
            values.newPassword.length < 8 ||
            values.newPassword !== values.confirmPassword
          }
        >
          {saving ? "Updating…" : "Update password"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  );
}
