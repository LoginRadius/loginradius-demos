// Simple geometric placeholders for IdP brand glyphs. Real production code
// should ship vendor-provided SVGs that pass their brand guidelines.

const SVG_MAP = {
  Google: {
    bg: "#fff",
    border: "1px solid #e5e7eb",
    inner: (
      <svg viewBox="0 0 48 48" width="22" height="22">
        <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
        <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 16.1 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.6-4.5 2.4-7.2 2.4-5.2 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C41.9 35.3 44 30 44 24c0-1.3-.1-2.6-.4-3.9z" />
      </svg>
    ),
  },
  Microsoft: {
    bg: "#fff",
    border: "1px solid #e5e7eb",
    inner: (
      <svg viewBox="0 0 48 48" width="22" height="22">
        <path fill="#F25022" d="M6 6h17v17H6z" />
        <path fill="#7FBA00" d="M25 6h17v17H25z" />
        <path fill="#00A4EF" d="M6 25h17v17H6z" />
        <path fill="#FFB900" d="M25 25h17v17H25z" />
      </svg>
    ),
  },
  Okta: {
    bg: "#fff",
    border: "1px solid #e5e7eb",
    inner: (
      <svg viewBox="0 0 32 32" width="22" height="22">
        <circle cx="16" cy="16" r="13" fill="none" stroke="#007DC1" strokeWidth="6" />
      </svg>
    ),
  },
  SAML: {
    bg: "#1f2937",
    border: "none",
    inner: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  OIDC: {
    bg: "#fff",
    border: "1px solid #e5e7eb",
    inner: (
      <span style={{ fontWeight: 700, fontSize: 11, fontFamily: "var(--font-mono)", color: "#0F172A" }}>
        OIDC
      </span>
    ),
  },
  GitHub: {
    bg: "#24292e",
    border: "none",
    inner: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff">
        <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.3 3.6 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.3-3.2-.1-.4-.6-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.6.2 2.8.1 3.2.8.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
      </svg>
    ),
  },
  JumpCloud: {
    bg: "#fff",
    border: "1px solid #e5e7eb",
    inner: (
      <svg viewBox="0 0 24 24" width="22" height="22">
        <path d="M12 2 L22 7 V17 L12 22 L2 17 V7 Z" fill="none" stroke="#1565c0" strokeWidth="2" />
      </svg>
    ),
  },
  PingId: {
    bg: "#fff",
    border: "1px solid #e5e7eb",
    inner: (
      <svg viewBox="0 0 24 24" width="22" height="22">
        <circle cx="12" cy="12" r="10" fill="none" stroke="#e22128" strokeWidth="3" />
        <circle cx="12" cy="12" r="3" fill="#e22128" />
      </svg>
    ),
  },
};

export function ProviderLogo({ name }) {
  const p = SVG_MAP[name] || SVG_MAP.SAML;
  return (
    <div
      className="provider-logo"
      style={{ background: p.bg, border: p.border, borderRadius: 6 }}
    >
      {p.inner}
    </div>
  );
}
