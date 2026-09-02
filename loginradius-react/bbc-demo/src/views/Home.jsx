"use client";

import Link from "next/link";
import { Masthead, Footer } from "../components/Chrome.jsx";
import { I } from "../components/Icons.jsx";
import { useBbcAuth } from "../hooks/useBbcAuth.jsx";
import { MISSING_CONFIG } from "../config/features.js";
import { STORIES, SAVED_ITEMS, TOPICS } from "../content/stories.js";

export function Home() {
  const { isAuthenticated, loading, user } = useBbcAuth();
  const [lead, ...rest] = STORIES;
  const sidebarStories = rest.slice(0, 4);
  const gridStories = rest.slice(4, 8);

  return (
    <div className="page-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <Masthead />

      <main id="main" className="page-body home-main">
        {isAuthenticated && <WelcomeStrip user={user} />}

        <div className="shell">
          <div className="hero-grid">
            <article>
              <a className="lead-story" href="#story">
                <div className="lead-media" />
                <h2 className="lead-title">{lead.title}</h2>
                <p className="lead-standfirst">{lead.standfirst}</p>
                <div className="meta">
                  <span className="meta-cat">{lead.category}</span>
                  <span>{lead.time}</span>
                </div>
              </a>

              <div className="story-list" style={{ marginTop: 24 }}>
                {sidebarStories.map((story) => (
                  <a className="story-row" href="#story" key={story.title}>
                    <div>
                      <h3 className="story-title">{story.title}</h3>
                      <div className="meta">
                        <span className="meta-cat">{story.category}</span>
                        <span>{story.time}</span>
                      </div>
                    </div>
                    <div className={`story-thumb ${story.tint}`} />
                  </a>
                ))}
              </div>
            </article>

            <aside>
              {isAuthenticated ? (
                <SavedPanel />
              ) : (
                <SignInPanel loading={loading} />
              )}
            </aside>
          </div>

          <div className="section-head">
            <h2 className="section-title">More to explore</h2>
          </div>

          <div className="card-grid">
            {gridStories.map((story) => (
              <a className="story-card" href="#story" key={story.title}>
                <div className={`story-media lead-media ${story.tint}`} />
                <h3>{story.title}</h3>
                <div className="meta">
                  <span className="meta-cat">{story.category}</span>
                  <span>{story.time}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function WelcomeStrip({ user }) {
  return (
    <div className="welcome-strip">
      <div className="shell welcome-inner">
        <span className="avatar avatar-lg">{user?.initials || "B"}</span>
        <div className="welcome-text">
          <h1>Welcome back{user?.firstName ? `, ${user.firstName}` : ""}</h1>
          <p>
            {user?.email
              ? `Signed in as ${user.email}`
              : "Your personalised BBC homepage"}
            {user && !user.emailVerified && " · email not yet verified"}
          </p>
        </div>
        <div className="welcome-actions">
          <Link href="/account" className="btn btn-primary">
            Your account <I.Arrow width={18} height={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function SavedPanel() {
  return (
    <>
      <div className="section-head" style={{ marginTop: 0 }}>
        <h2 className="section-title">Saved for you</h2>
      </div>
      <div className="story-list">
        {SAVED_ITEMS.map((item) => (
          <a className="story-row" href="#story" key={item.title}>
            <div>
              <h3 className="story-title">{item.title}</h3>
              <div className="meta">
                <I.Bookmark width={14} height={14} />
                <span>{item.saved}</span>
              </div>
            </div>
            <div className={`story-thumb ${item.tint}`} />
          </a>
        ))}
      </div>

      <div className="section-head">
        <h2 className="section-title">Your topics</h2>
      </div>
      <div className="topic-chips">
        {TOPICS.map((topic) => (
          <a className="chip" href="#topic" key={topic}>
            {topic}
          </a>
        ))}
      </div>
    </>
  );
}

function SignInPanel({ loading }) {
  const { startSignIn, signingIn, authError } = useBbcAuth();
  const expired =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("signedout") === "expired";

  return (
    <div className="signin-panel">
      <h2>Sign in to personalise the BBC</h2>
      <p>
        One account for saved stories, followed topics and picking up where you
        left off across your devices.
      </p>

      {MISSING_CONFIG.length > 0 && (
        <div className="panel-note">
          Missing configuration: <code>{MISSING_CONFIG.join(", ")}</code>. Copy{" "}
          <code>.env.example</code> to <code>.env.local</code> and restart the dev
          server.
        </div>
      )}

      {expired && (
        <div className="panel-note">
          Your session expired and you were signed out. Sign in again to continue.
        </div>
      )}

      <ul className="signin-benefits">
        <li><I.Bookmark width={18} height={18} /> Save stories to read later</li>
        <li><I.Bell width={18} height={18} /> Follow the topics you care about</li>
        <li><I.Lock width={18} height={18} /> Two-factor sign in and passkeys</li>
      </ul>

      <button
        type="button"
        className="btn btn-onblack btn-lg btn-block"
        onClick={startSignIn}
        disabled={signingIn || loading || MISSING_CONFIG.length > 0}
      >
        {signingIn ? "Redirecting…" : "Sign in with your BBC account"}
      </button>

      {authError && (
        <p className="signin-foot" role="alert" style={{ color: "#ff9a9a" }}>
          {authError}
        </p>
      )}

      <p className="signin-foot">
        You'll continue on the BBC account service and come back here once you're
        signed in. This demo uses OAuth 2.0 authorization code with PKCE — no
        client secret is held in the browser.
      </p>
    </div>
  );
}