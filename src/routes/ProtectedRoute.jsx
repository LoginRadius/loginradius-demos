import { Navigate, useLocation } from "react-router-dom";
import {
  useLoginRadiusSDK,
  useLRAuth,
} from "@loginradius/loginradius-react";
import { I } from "../components/Icons.jsx";

// Auth guard for /admin/*. Waits for the SDK to finish bootstrapping (it must
// consume any OIDC params on the redirect URI before isAuthenticated flips to
// true) and then either renders children or bounces to /home.
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useLRAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-card">
          <div className="auth-loading-spin"><I.Refresh /></div>
          <div>
            <div className="auth-loading-title">Signing you in…</div>
            <div className="auth-loading-sub">
              Finalizing the OIDC exchange and loading your workspace.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // if (!isAuthenticated) {
  //   return <Navigate to="/home" replace state={{ from: location }} />;
  // }

  return children;
}
