"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BbcLogo } from "./BbcLogo.jsx";
import { I } from "./Icons.jsx";
import { useBbcAuth } from "../hooks/useBbcAuth.jsx";
import { useProfiles } from "../context/ProfileContext.jsx";

const NAV = [
  { label: "Home", to: "/" },
  { label: "News", to: "/" },
  { label: "Sport", to: "/" },
  { label: "Business", to: "/" },
  { label: "Innovation", to: "/" },
  { label: "Culture", to: "/" },
  { label: "Travel", to: "/" },
  { label: "Earth", to: "/" },
];

export function Masthead() {
  const { isAuthenticated, loading, user, startSignIn, signingIn, signOut } =
    useBbcAuth();
  const { activeProfile, clearProfile } = useProfiles();
  const pathname = usePathname();
  const router = useRouter();

  // Switching is "forget the choice, ask again" — the picker owns selection,
  // so there is only one place that decides what active means.
  const switchProfile = () => {
    clearProfile();
    router.push("/profiles");
  };

  return (
    <header className="masthead">
      <div className="shell masthead-top">
        <Link href="/" className="masthead-logo" aria-label="BBC Homepage">
          <BbcLogo />
        </Link>

        <div className="masthead-spacer" />

        <div className="masthead-actions">
          {loading ? null : isAuthenticated ? (
            <>
              {activeProfile && (
                <button
                  type="button"
                  className="masthead-user masthead-profile"
                  onClick={switchProfile}
                  title="Switch profile"
                >
                  <span className="avatar">
                    {(activeProfile.displayName || "?")[0].toUpperCase()}
                  </span>
                  <span className="masthead-user-name">
                    {activeProfile.displayName}
                  </span>
                  <span className="masthead-switch">Switch</span>
                </button>
              )}
              <Link href="/account" className="masthead-user">
                <span className="avatar">{user?.initials || "B"}</span>
                <span className="masthead-user-name">
                  {user?.firstName || "Your account"}
                </span>
              </Link>
              <button type="button" className="btn btn-onblack" onClick={signOut}>
                Sign out
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-onblack"
              onClick={startSignIn}
              disabled={signingIn}
            >
              {signingIn ? "Redirecting…" : "Sign in"}
            </button>
          )}
        </div>
      </div>

      <nav className="globalnav" aria-label="BBC navigation">
        <div className="shell">
          <ul className="globalnav-list">
            {NAV.map((item, i) => (
              <li key={item.label}>
                <Link
                  href={item.to}
                  className={`globalnav-link${
                    pathname === item.to && i === 0 ? " active" : ""
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell">
        <ul className="footer-links">
          <li><a href="#terms">Terms of Use</a></li>
          <li><a href="#about">About the BBC</a></li>
          <li><a href="#privacy">Privacy Policy</a></li>
          <li><a href="#cookies">Cookies</a></li>
          <li><a href="#accessibility">Accessibility Help</a></li>
          <li><Link href="/account">Your account</Link></li>
        </ul>
        <p className="footer-note">
          Demo build — an integration sample for the LoginRadius React SDK running
          against a B2C tenant. Not affiliated with or endorsed by the BBC; the
          stories and branding here stand in for a real consumer property.
        </p>
      </div>
    </footer>
  );
}

export function LoadingScreen({ title, sub }) {
  return (
    <div className="loading-screen">
      <div>
        <div className="spinner" />
        <h2>{title}</h2>
        <p>{sub}</p>
      </div>
    </div>
  );
}

export { I };