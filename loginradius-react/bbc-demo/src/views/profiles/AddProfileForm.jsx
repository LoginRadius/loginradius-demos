"use client";

import { useState } from "react";
import { I } from "../../components/Icons.jsx";

// Shared add-profile form. POSTs to /api/linked-accounts, which validates,
// appends to the custom object and returns the re-read graph — so the caller
// renders what was actually stored rather than optimistic local state.
export function AddProfileForm({
  accessToken,
  onAdded,
  onCancel,
  submitLabel = "Add profile",
}) {
  const [values, setValues] = useState({
    displayName: "",
    dateOfBirth: "",
    isMinimumAge: false,
    allowPersonalisation: true,
    allowMarketingDataTransfer: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (e) =>
    setValues((v) => ({
      ...v,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/linked-accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(values),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || `Request failed (${res.status})`);
      onAdded(body.graph, body.profileId);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form className="profile-form" onSubmit={submit}>
      <div className="profile-form-row">
        <label htmlFor="pf-name">Display name</label>
        <input
          id="pf-name"
          value={values.displayName}
          onChange={set("displayName")}
          maxLength={50}
          required
          autoFocus
        />
      </div>

      <div className="profile-form-row">
        <label htmlFor="pf-dob">Date of birth</label>
        <input
          id="pf-dob"
          type="date"
          value={values.dateOfBirth}
          onChange={set("dateOfBirth")}
          max={new Date().toISOString().slice(0, 10)}
        />
      </div>

      <label className="profile-check">
        <input type="checkbox" checked={values.isMinimumAge} onChange={set("isMinimumAge")} />
        This profile is for a child
      </label>

      <label className="profile-check">
        <input
          type="checkbox"
          checked={values.allowPersonalisation}
          onChange={set("allowPersonalisation")}
        />
        Allow personalisation
      </label>

      <label className="profile-check">
        <input
          type="checkbox"
          checked={values.allowMarketingDataTransfer}
          onChange={set("allowMarketingDataTransfer")}
        />
        Allow marketing data transfer
      </label>

      {error && (
        <div className="notice" style={{ marginTop: 4 }}>
          <I.Alert width={18} height={18} />
          <div>{error}</div>
        </div>
      )}

      <div className="profile-form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving || !values.displayName.trim()}
        >
          {saving ? "Adding…" : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
