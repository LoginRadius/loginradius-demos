import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useLRAuth } from "@loginradius/loginradius-react";
import { I } from "../components/Icons.jsx";

export function Home() {
  const { pkceLogin, isAuthenticated, profile } = useLRAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Already authenticated → straight to the admin portal.
  console.log("Is Authenticated", isAuthenticated)
  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      // PKCE flow — the SDK generates the verifier, builds the authorization
      // URL with code_challenge, and we redirect to the LoginRadius IdP.
      const url = await pkceLogin.getAuthorizeEndpoint();
      if (!url) throw new Error("Authorization URL was empty");

      // Forward any query params from the current page (e.g. ?vtype=orginvite&vtoken=...)
      // onto the authorize URL so the IdP can pick them up after redirect.
      const incoming = new URLSearchParams(window.location.search);
      const authorizeUrl = new URL(url);
      incoming.forEach((value, key) => {
        authorizeUrl.searchParams.set(key, value);
      });

      window.location.href = authorizeUrl.toString();
    } catch (err) {
      setLoading(false);
      setError(
        err?.message ||
          "Unable to start sign-in. Verify your OIDC configuration and try again.",
      );
    }
  };

  return (
    <div className="signin-shell">
      <div className="signin-card">
        <div className="signin-brand">
          <div className="brand-mark"><I.Helix /></div>
          <div>
            <div className="brand-name">Helix</div>
            <div className="brand-tag">Identity Platform</div>
          </div>
        </div>

        <h1 className="signin-title">Sign in to your workspace</h1>
        <p className="signin-sub">
          Authenticate with your organization's identity provider via OIDC. We
          use the PKCE flow — no client secret is exposed in the browser.
        </p>

        {profile?.name && (
          <div className="signin-hint">Signed in as <strong>{profile.name}</strong></div>
        )}

        <button
          type="button"
          className="btn btn-primary btn-lg signin-btn"
          onClick={handleSignIn}
          disabled={loading}
        >
          {loading ? "Redirecting…" : <>Sign in with SSO <I.ExternalLink /></>}
        </button>

        {error && (
          <div className="signin-error" role="alert">
            <I.Alert /> <span>{error}</span>
          </div>
        )}

        <div className="signin-foot">
          By signing in you agree to the Acceptable Use Policy. Need help?{" "}
          <a href="https://www.loginradius.com/docs" target="_blank" rel="noreferrer">
            Read the docs <I.ExternalLink />
          </a>
        </div>
      </div>

      <SignInBackdrop />
    </div>
  );
}

function SignInBackdrop() {
  useEffect(() => {
    document.body.dataset.signin = "on";
    return () => {
      delete document.body.dataset.signin;
    };
  }, []);
  return null;
}
