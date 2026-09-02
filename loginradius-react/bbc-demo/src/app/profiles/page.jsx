import { Suspense } from "react";
import { Profiles } from "../../views/Profiles.jsx";
import { ProtectedRoute } from "../../components/ProtectedRoute.jsx";
import { LoadingScreen } from "../../components/Chrome.jsx";

// Reads ?next=, so it needs a Suspense boundary like /account.
export default function ProfilesPage() {
  return (
    <Suspense fallback={<LoadingScreen title="Loading" sub="One moment." />}>
      <ProtectedRoute>
        <Profiles />
      </ProtectedRoute>
    </Suspense>
  );
}
