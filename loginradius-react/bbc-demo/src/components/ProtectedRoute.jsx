"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLRAuth } from "@loginradius/loginradius-react";
import { LoadingScreen } from "./Chrome.jsx";

// Guards /account. `loading` from useLRAuth stays true until the provider has
// finished the PKCE code exchange (it covers both SDK init and pkceReady), so
// the bounce below can't fire while ?code= is still being redeemed — which is
// exactly the state this route is in right after the IdP sends the user back.
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useLRAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/");
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return (
      <LoadingScreen
        title="Signing you in"
        sub="Completing the secure exchange with the BBC account service."
      />
    );
  }

  return children;
}
