"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Masthead, Footer } from "../components/Chrome.jsx";
import { I } from "../components/Icons.jsx";
import { useBbcAuth } from "../hooks/useBbcAuth.jsx";
import { SECTIONS } from "./account/sections.jsx";

export function Account() {
  const { user, signOut } = useBbcAuth();
  const params = useSearchParams();
  const router = useRouter();

  // A security magic-link return (?vtype=reset|deleteuser&vtoken=…) has to land
  // on the security section: only the mounted section's widgets run, so if we
  // opened on "details" the token would never be consumed.
  const magicLinkSection = useMemo(() => {
    const vtype = params.get("vtype");
    if (!params.get("vtoken")) return null;
    if (vtype === "reset") return "security";
    if (vtype === "deleteuser") return "close";
    return null;
  }, [params]);

  const requested = params.get("section");
  const initial =
    magicLinkSection ||
    (SECTIONS.some((s) => s.id === requested) ? requested : SECTIONS[0].id);

  const [active, setActive] = useState(initial);
  const section = SECTIONS.find((s) => s.id === active) ?? SECTIONS[0];

  const selectSection = (id) => {
    setActive(id);
    // next/navigation's useSearchParams is read-only; the URL half of the
    // update goes through the router. scroll:false keeps the rail in place.
    const next = new URLSearchParams(params);
    next.set("section", id);
    router.replace(`/account?${next.toString()}`, { scroll: false });
  };

  // Centralised widget callbacks — one surface to watch while integrating.
  const onSuccess = (data) => console.log("[BBC account] success:", data);
  const onError = (err) => console.error("[BBC account] error:", err);

  const Panel = section.Panel;

  return (
    <div className="page-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <Masthead />

      <div className="account-hero">
        <div className="shell account-hero-inner">
          <span className="avatar avatar-lg">{user?.initials || "B"}</span>
          <div>
            <h1>{user?.name || "Your BBC account"}</h1>
            <p>{user?.email || "Manage your sign-in details and preferences"}</p>
          </div>
          <div className="account-hero-actions">
            <button type="button" className="btn btn-onblack" onClick={signOut}>
              <I.Exit width={18} height={18} /> Sign out
            </button>
          </div>
        </div>
      </div>

      <main id="main" className="page-body">
        <div className="shell account-layout">
          <nav className="account-rail" aria-label="Account sections">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`rail-link${active === s.id ? " active" : ""}${
                    s.danger ? " danger" : ""
                  }`}
                  aria-current={active === s.id ? "page" : undefined}
                  onClick={() => selectSection(s.id)}
                >
                  <Icon width={18} height={18} />
                  {s.label}
                </button>
              );
            })}
          </nav>

          <div className="account-panel">
            <div className="panel-head">
              <h2>{section.title}</h2>
              <p>{section.blurb}</p>
            </div>
            <Panel onSuccess={onSuccess} onError={onError} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}