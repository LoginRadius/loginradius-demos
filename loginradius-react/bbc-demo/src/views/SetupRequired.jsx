"use client";

import { BbcLogo } from "../components/BbcLogo.jsx";
import { I } from "../components/Icons.jsx";

// LoginRadiusProvider throws outright when apiKey is absent, which would blank
// the page. Catch that case before mounting it and say what's missing instead.
export function SetupRequired({ missing }) {
  // Rendered during the server prerender pass too, where there is no window.
  const origin =
    typeof window === "undefined" ? "http://localhost:5174" : window.location.origin;

  return (
    <div className="page-shell">
      <header className="masthead">
        <div className="shell masthead-top">
          <span className="masthead-logo"><BbcLogo /></span>
        </div>
      </header>

      <main className="page-body shell" style={{ padding: "48px 16px", maxWidth: 720 }}>
        <div className="section-head" style={{ marginTop: 0 }}>
          <h1 className="section-title">Configuration needed</h1>
        </div>

        <p style={{ fontSize: 16, color: "var(--bbc-ink-2)" }}>
          This demo needs a <strong>B2C</strong> LoginRadius tenant before it can
          start the sign-in flow.
        </p>

        <div className="notice" style={{ margin: "20px 0" }}>
          <I.Alert width={18} height={18} />
          <div>
            Not set:{" "}
            <strong>{missing.join(", ")}</strong>
          </div>
        </div>

        <ol style={{ fontSize: 15, lineHeight: 1.7, paddingLeft: 20 }}>
          <li>Copy <code>.env.example</code> to <code>.env.local</code>.</li>
          <li>Fill in the API key, OIDC app name and client ID from your tenant.</li>
          <li>
            Register <code>{origin}/account</code> as an allowed redirect URI on
            that OIDC app.
          </li>
          <li>Restart the dev server — Vite only reads env files at startup.</li>
        </ol>

        <p style={{ fontSize: 14, color: "var(--bbc-ink-3)" }}>
          The tenant must have <code>IsB2BEnabled</code> false. On a B2B tenant the
          PKCE token is kept in the org session instead of the standard token
          cache, and the account page will never see you as signed in.
        </p>
      </main>
    </div>
  );
}