"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useProfiles } from "../context/ProfileContext.jsx";

// Holds an authenticated viewer at /profiles until a profile is active.
//
// Deliberately fails open. The gate only ever redirects on a *positive*
// signal — graph loaded, zero active profiles — so an API outage, an expired
// token or a slow first load can't lock someone out of the whole app. A
// broken linked-accounts endpoint should cost you the profile picker, not
// the site.
const EXEMPT = ["/profiles"];

export function ProfileGate({ children }) {
  const { status, isAuthenticated, authLoading, activeProfileId, graph } =
    useProfiles();
  const isChild = !!graph?.viewer?.isChild;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const exempt = EXEMPT.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  useEffect(() => {
    if (exempt) return;
    // Signed out is the public site — no gate.
    if (authLoading || !isAuthenticated) return;
    // Only act once the graph is known to be good and genuinely empty of a
    // selection. status "error" and "loading" both fall through.
    if (status !== "ready" || activeProfileId) return;
    // Child accounts own no profiles — gating them would strand them on a
    // picker they are not allowed to use.
    if (isChild) return;

    // Remember where they were headed so selection can return them there.
    const qs = searchParams.toString();
    const next = qs ? `${pathname}?${qs}` : pathname;
    router.replace(`/profiles?next=${encodeURIComponent(next)}`);
  }, [
    exempt, authLoading, isAuthenticated, status, activeProfileId, isChild,
    pathname, searchParams, router,
  ]);

  return children;
}
