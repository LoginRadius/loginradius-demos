import { Suspense } from "react";
import { Account } from "../../views/Account.jsx";
import { ProtectedRoute } from "../../components/ProtectedRoute.jsx";
import { LoadingScreen } from "../../components/Chrome.jsx";

// Also the OIDC redirect URI — the provider redeems ?code= once it mounts,
// and ProtectedRoute holds the page until that exchange settles.
//
// The Suspense boundary is required: Account reads useSearchParams (for
// ?section= and the ?vtype/?vtoken magic-link return), and Next refuses to
// prerender a route that calls it outside one.
export default function AccountPage() {
  return (
    <Suspense
      fallback={<LoadingScreen title="Loading your account" sub="One moment." />}
    >
      <ProtectedRoute>
        <Account />
      </ProtectedRoute>
    </Suspense>
  );
}
