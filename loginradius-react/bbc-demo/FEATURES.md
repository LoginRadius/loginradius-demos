# BBC B2C demo — implemented features

A technical reference for what this demo does and how. Setup, environment
variables and deployment live in [README.md](./README.md); this document covers
the features themselves — the flows, the data model, the decisions and the
traps found while building them.

The demo is a BBC-styled consumer property backed by a **B2C** LoginRadius
tenant. It exercises three things that are awkward to demo separately: hosted
OIDC sign-in over PKCE, the SDK's profile widgets embedded in a host design,
and a household account model (guardian/child accounts plus viewing profiles)
stored in a Custom Object and reached through Machine-to-Machine credentials.

| Feature | Entry point | Backed by |
|---|---|---|
| Hosted PKCE sign-in | `/` | SDK `pkceLogin` + `LoginRadiusProvider` |
| Personalised home | `/` | `useLRAuth` / `useBbcAuth` |
| Account management | `/account` | 11 SDK profile widgets |
| Linked accounts & profiles | `/account?section=linked` | `/api/linked-accounts` |
| Profile gate ("who's watching") | `/profiles` | `ProfileContext` + `ProfileGate` |
| Add a profile | `/profiles`, account section | `POST /api/linked-accounts` |

---

## 1. Why Next.js

The original build was Vite + React Router. It moved to the Next.js App Router
for one load-bearing reason: reading the account graph needs a **Machine-to-
Machine token**, and minting one needs a client secret. A secret cannot live in
a single-page app. It now lives in a route handler under `src/app/api/`, and
`src/server/*` carries the `server-only` import so that importing it from a
client component is a build error rather than a leaked credential.

Everything else about the migration was incidental: `next/link` and
`next/navigation` replacing React Router, `NEXT_PUBLIC_*` replacing
`import.meta.env.VITE_*`, and `src/pages/` renamed to `src/views/` because a
`src/pages` directory silently switches Next into the Pages Router.

### Runtime topology

```
browser                          Next server                 LoginRadius
───────                          ───────────                 ───────────
LoginRadiusProvider  ──────────────────────────────────────▶ hosted authorize
  (ssr:false)        ◀────────────────────────────────────── ?code=…
  PKCE exchange      ──────────────────────────────────────▶ /service/oauth/token
  access token in browser

fetch /api/linked-accounts
  Authorization: Bearer <user token>
                     ──▶ route handler
                            ├─ GET /identity/v2/auth/account   (user's token)
                            ├─ POST /service/oauth/token       (M2M creds)
                            └─ GET  /identity/v2/manage/…      (M2M token)
                     ◀── normalised graph
```

The SDK is browser-only — it reads `window`/`sessionStorage` on init and writes
its theme variables onto `document.documentElement`. `providers.jsx` loads it
via `dynamic(..., { ssr: false })` so it never evaluates during pre-render.
`ssr: false` is only legal inside a client component, which is why that file
carries `"use client"`.

---

## 2. Hosted PKCE sign-in

**Files:** `src/hooks/useBbcAuth.jsx`, `src/config/features.js`,
`src/components/ProtectedRoute.jsx`

The sign-in panel calls `pkceLogin.getAuthorizeEndpoint()`. The SDK generates
the verifier, stashes it in `sessionStorage` and returns an authorize URL
carrying `code_challenge` + `code_challenge_method=S256`. No client secret is
held in the browser.

Before redirecting, `useBbcAuth` copies any params already on the page onto the
authorize URL — `?vtype=…&vtoken=…` from a verification email, `?action=…` — so
the hosted page can pick them up.

The IdP returns to **`/account?code=…`**, which is both the redirect URI and a
real page. `LoginRadiusProvider` redeems the code on mount. `ProtectedRoute`
holds the page on a loading state while that happens, because
`useLRAuth().loading` stays true until the exchange settles — without that wait,
the guard would fire before authentication completed and bounce the user home
mid-exchange.

### B2C is not B2B, and the SDK does not say so loudly

`isB2BEnabled` is not a local switch. The SDK reads it from the tenant's app
config (`mapOptions.ts`). On a B2C tenant `LoginRadiusProvider` writes the PKCE
access token into the standard token cache, which is what makes
`useLRAuth().isAuthenticated` true and the profile widgets work. Point this at a
B2B tenant and none of that happens.

Verified against the SDK source, not the docs:

| API | Behaviour on B2C |
|---|---|
| `pkceLogin.getAuthorizeEndpoint()` / `.login()` | Work — not gated |
| `pkceLogin.isAuthenticated` / `.tenantAccessToken` / `.profile` / `.logout` / `.refreshTenant` | **Always empty.** `useLRAuth` nulls the tenant session whenever `isB2BEnabled` is false |
| `useLRAuth().user` | **Always null** — the hook never calls its own setter |
| `OrgContextProvider`, `piam/Organization*`, `AdminPortal`, `RequireOrg`, `ScopeGate` | B2B only; `useOrgContext` throws outside its provider |
| `Profile` and every profile sub-widget | B2C-safe, no org coupling |

Consequences baked into this demo: auth state is read from the **top-level**
`useLRAuth()` fields, and the user profile comes from
`useLoginRadiusSDK().profileData`, populated once in `useBbcAuth` so the widgets
mount with data rather than each firing its own `getAccount`.

### No token renewal

Nothing renews a B2C access token. The OIDC `refresh_token` from the exchange is
written to the org snapshot, but the React layer's refresh path is gated behind
`isB2BEnabled`. The session simply ends when the token expires — see
[§7](#7-session-handling).

---

## 3. Account area

**Files:** `src/views/Account.jsx`, `src/views/account/sections.jsx`,
`src/sdk/index.jsx`, `src/sdk/SDKBoundary.jsx`

`/account` is a left rail plus six sections, deep-linkable via `?section=`. Each
section is BBC card chrome the demo owns, wrapping an SDK widget.

| Section | SDK export | Tenant config it depends on |
|---|---|---|
| Your details | `PersonalDetails` | — |
| " | `EditUsername` | `duplicateEmailWithUniqueUsername` |
| Sign in & security | `ChangePassword` | — |
| " | `SetupTwoFactorAuth` | `twoFactorAuthentication` |
| " | `AddPasskey` | `isPassKeysEnabled` |
| " | `ChangePin` | `isPINAuthentication` |
| " | `ResetBackupCode` | a verified second factor |
| Contact details | `AddEmail` | — |
| " | `EditPhone` | `phoneLogin` |
| Connected accounts | `LinkAccount` | social providers + verified email |
| Linked accounts | *(not a widget — see §4)* | `link_account` custom object |
| Close account | `DeleteAccount` | — |

Two naming traps the `WIDGETS` map in `src/sdk/index.jsx` exists to avoid:
the profile-scoped components differ from similarly named auth-flow steps
(`ChangePin` is the profile section, `ChangePIN` is the login step), and
several exports are aliased (`AddEmail` is `EmailProfileComponent`). Getting one
wrong renders the wrong thing silently.

**`SdkWidget`** wraps every widget in three layers:

1. `NEXT_PUBLIC_USE_SDK=false` swaps all of them for static fallbacks, so the
   chrome can be reviewed without a live tenant.
2. A missing export logs a warning and renders the fallback instead of crashing.
3. `SDKBoundary` (an error boundary) contains a widget crash to its own section.

A magic-link return (`?vtype=reset|deleteuser&vtoken=…`) forces the matching
section open, because only the mounted section's widgets run — landing on
"Your details" would leave the token unconsumed.

---

## 4. Linked accounts and profiles

**Files:** `src/app/api/linked-accounts/route.js`, `src/server/loginradius.js`,
`src/server/linkedAccounts.js`, `src/server/shapeAccountGraph.js`,
`src/server/errors.js`

### The data model

One `link_account` Custom Object record per identity, holding both halves:

```jsonc
{
  "CustomObject": {
    "LinkedAccounts": [                     // present on both sides
      { "LinkType": "child", "ReferenceId": "55cfd2fe…" }
    ],
    "Profiles": [                           // guardian's record
      {
        "Id": "prf_01H123456", "DisplayName": "Ops Console",
        "DateOfBirth": "1995-05-15T00:00:00Z", "IsMinimumAge": true,
        "AllowPersonalisation": false, "AllowMarketingDataTransfer": false,
        "Status": "active", "Verified": false, "Revision": 1,
        "CreatedAt": "…", "UpdatedAt": "…"
      }
    ]
  },
  "Id": "6a95d876a4b57217aa90f373",
  "Uid": "512fc236f84244059acba34350f67799"
}
```

`LinkType` names the **other** end of the link. An identity carrying `child`
entries is itself a guardian; one carrying `parent` entries is a child account.
`shapeAccountGraph` derives `viewer.role` as `parent` / `child` / `unlinked`
from exactly that, so one code path serves both viewpoints.

### The request path

`GET /api/linked-accounts` with the caller's own bearer token:

1. Resolve the caller via `GET /identity/v2/auth/account`. **The uid is never
   taken from the request** — a client could otherwise name any uid and read
   someone else's household.
2. Mint or reuse an M2M token.
3. `GET /identity/v2/manage/account/{uid}/customobject?objectname=link_account`.
4. Resolve every `ReferenceId` to an account, in parallel under
   `Promise.allSettled`, so one unreadable link degrades a single row rather
   than the whole section.
5. Return a normalised graph: `viewer`, `children`, `parents`, `profiles`,
   `counts`, `objectRecordId`.

### M2M token lifecycle

`POST https://<hub>/service/oauth/token` with `grant_type=client_credentials`,
`client_id`, `client_secret`, `audience`. The response's `expire_in` is a string
of seconds.

- Cached at module scope and reused until 60s before expiry.
- Concurrent misses are collapsed by an in-flight promise, so a burst of page
  loads mints one token, not one each.
- `manageFetch` retries once on 401 with a forced refresh, because a token can
  expire between the staleness check and the call landing.
- Errors surface the provider's code but never the request body, which carries
  the secret.

### Error 1057 is an empty state, not a failure

An account with no record yet gets **HTTP 403 with `ErrorCode: 1057`** —
"The requested custom object of the user's account could not be found". Every
user hits this before their first profile. `getLinkAccountObject` catches that
one code and returns `{ Count: 0, data: [] }`, giving callers a single path.
Detection is by numeric code, not by matching the description text, which is
localisable. Any other code still throws.

---

## 5. Adding a profile

**Files:** `src/server/profiles.js`, `src/views/profiles/AddProfileForm.jsx`

There is no append operation on the Custom Object API, so `POST
/api/linked-accounts` is a read-modify-write:

1. **Validate** (`validateProfileInput`) — display name required and ≤50 chars,
   date of birth optional but must parse and not be in the future. Booleans are
   **coerced**, not passed through, so a form's `"false"` string cannot land in
   the object as a truthy value.
2. **Read** the current object.
3. **Build** the record in the stored PascalCase shape, with a ULID-shaped
   `prf_01H…` id. The ids already in the object are ULIDs; the generator uses
   Crockford base32 with a time prefix, so ids sort by creation order — a random
   UUID would not.
4. **Append** (`appendProfile`) — enforces the cap
   (`LOGINRADIUS_PROFILE_CAP`, default 20) and rejects a duplicate display name
   case-insensitively. Returns a new array; never mutates.
5. **Write** — `POST …/customobject` when no record exists yet, otherwise
   `PUT …/customobject/{objectrecordid}` with **`updateType=partialreplace`**
   and a body of just `{ Profiles: [...] }`.
6. **Re-read** and return the fresh graph, so the UI renders what was stored
   rather than optimistic local state.

### Why `partialreplace`

It is an upsert over top-level keys, so sending only `Profiles` leaves
`LinkedAccounts` untouched even if our read of it was stale. `replace` swaps the
entire object and would drop any key we did not send — including anything
another system added between read and write.

The two API references disagree on the parameter's casing (`updateType` in the
OpenAPI reference, `updatetype` in the v2 reference), so both are sent with the
same value.

---

## 6. The profile gate

**Files:** `src/context/ProfileContext.jsx`, `src/components/ProfileGate.jsx`,
`src/views/Profiles.jsx`, `src/views/profiles/gate.js`

`/profiles` is the "who's watching" screen. An authenticated viewer is held
there until a profile is active.

`resolveGateState()` is a pure function, so the scenarios are testable rather
than buried in render logic:

| Graph state | Resolves to | Behaviour |
|---|---|---|
| 0 profiles | `add-first` | Create-profile form; the new profile becomes active |
| 1 profile, none active | `adopt-one` | Adopted silently, straight through |
| 2+ profiles, none active | `choose` | Tile picker |
| any, one active | `ready` | Passes through |
| graph loading | `loading` | No decision |
| graph errored | `error` | No decision — see below |

### It fails open, by design

`ProfileGate` only redirects on a **positive** signal: graph loaded *and* no
active profile. A slow load, an expired token or a broken
`/api/linked-accounts` all fall through. A failing endpoint should cost you the
profile picker, not the entire site. The error state also offers "Continue
without choosing" rather than trapping the viewer.

### Active profile storage

Stored in `localStorage` under `bbc.activeProfile.<uid>`.

- **Keyed per uid**, so a shared browser cannot carry one account's selection
  into the next person's session.
- **Reconciled** against the server's list on every load. A profile deleted on
  another device, or an id typed into devtools, resolves to "nothing selected"
  rather than a dangling reference.
- Reads and writes are wrapped in `try/catch` — Safari private mode and
  "block all cookies" both throw on access.

> **This is a UI preference, not an authorization decision.** A user can edit
> localStorage and swap a kids profile for an adult one. Reconciliation stops a
> hand-edited id conjuring a profile that does not exist on the identity, but it
> cannot stop someone selecting a different *real* profile. If age limits or
> consent must be *enforced*, the server has to resolve the active profile
> itself from the access token and the stored object — never from a
> client-supplied id.

### Two correctness details worth keeping

**`?next=` is sanitised.** `safeNext()` accepts only a same-origin absolute
path. Without it the gate would be an open redirect immediately after
authentication. `//evil.example` and `/\evil.example` are both treated as
absolute by browsers, so a naive `startsWith("/")` check is not enough.

**Selection after an add is atomic.** `applyGraph(graph, selectId)` sets the
graph and selects in one call, validating against the graph *being applied*.
Doing it as two calls fails: `setState` is not synchronous, so a following
`selectProfile()` would still be checking the previous profile list and would
reject the profile just created — bouncing the user straight back to the picker.

### Switching

The masthead shows the active profile with a Switch action, which clears the
selection and returns to `/profiles`. The picker owns selection, so only one
place decides what "active" means.

---

## 7. Session handling

**File:** `src/hooks/useSessionGuard.jsx`

Because nothing renews a B2C access token, the first unauthorized response ends
the session cleanly instead of leaving half the account page on stale skeletons.
The guard matches LoginRadius error codes (401, 905, 906, 920) and message
patterns, then calls `ssoLogout()` and returns the viewer to `/?signedout=expired`.
A module-level latch makes sure that happens once even when several widgets fail
simultaneously.

---

## 8. Theming

**File:** `src/styles/bbc.css`

BBC palette and type approximating bbc.com — black masthead, `#b80000` core red,
`#bb1919` news red, square corners, Reith fallback stack (Reith is proprietary,
so the stack falls through to Helvetica/Arial exactly as the BBC's own does).

### Theming the SDK widgets

`LoginradiusCore` writes its `--sdk-*` values as **inline styles on `<html>`** at
init, so a `:root` override in CSS loses to them. `.bbc-sdk-scope` redeclares
those custom properties on a wrapper element instead, which wins for its
subtree. That class is the entire BBC theming layer for the SDK — 67 tokens
covering buttons, inputs, cards, alerts, links and social buttons.

### The reset that bites

The SDK's runtime-injected stylesheet carries a blanket reset:

```css
button, input, select, textarea { appearance: none; border: none; background: transparent }
```

It applies to **every** control on the page, not just the SDK's own. Any native
control this app renders must opt back in explicitly — see
`.profile-check input[type="checkbox"]`, which without it reserves its 16px box
and paints nothing at all.

---

## 9. Tests

`pnpm test` — plain `node:assert`, no framework. The pure logic is deliberately
split out of the I/O modules so it can be exercised directly.

| File | Covers |
|---|---|
| `tests/shapeAccountGraph.test.mjs` | Parent and child payload shaping against the real object format; unresolved links; missing/empty record; malformed entries; 1057 detection |
| `tests/profiles.test.mjs` | Validation including the `"false"` coercion trap; record shape and ULID format; append non-mutation; duplicate names; cap boundary |
| `tests/gate.test.mjs` | The three scenarios; fail-open on error/loading; `?next=` open-redirect rejection |

Not covered: anything requiring a live tenant — the PKCE round trip, the M2M
exchange, and the write path against the real API.

---

## 10. Known limitations

- **Read-modify-write races.** The Custom Object endpoint has no ETag or
  If-Match, so two profile adds racing on the same identity can lose one write.
  Acceptable for a single-user demo; a production owner service would serialise
  writes per uid.
- **No token renewal** on B2C (§2). Sessions end at token expiry.
- **`signOut` currently re-authenticates.** `useBbcAuth.signOut()` calls
  `ssoLogout()` and then `startSignIn()`, so it redirects back to the hosted
  authorize page rather than returning to the signed-out home page. The
  `logout()` call and the redirect home are commented out. If the intent was to
  demonstrate that the SSO session is gone, this works; if it was a plain sign
  out, it does not. The active profile in localStorage is also not cleared on
  sign-out (harmless, since keys are uid-scoped).
- **Not implemented:** editing or deleting profiles, and linking or unlinking
  accounts. Linking touches two identities' objects and needs mirrored writes.
- **`dist/` is stale** — a leftover from the Vite build, ignored by git and safe
  to delete.

---

## 11. File map

```
src/
├── app/                              App Router
│   ├── layout.jsx                    server; global CSS + <Providers>
│   ├── providers.jsx                 client; SDK provider (ssr:false) → ProfileProvider → ProfileGate
│   ├── page.jsx                      /
│   ├── account/page.jsx              /account — OIDC redirect URI, guarded, Suspense
│   ├── profiles/page.jsx             /profiles — the gate
│   └── api/linked-accounts/route.js  GET graph, POST add profile; holds the M2M secret
├── server/                           server-only — never import from a client component
│   ├── loginradius.js                M2M token cache, manageFetch, token→identity
│   ├── linkedAccounts.js             orchestration: read, resolve links, write
│   ├── shapeAccountGraph.js          pure shaping (tested)
│   ├── profiles.js                   pure validation, record build, append (tested)
│   └── errors.js                     LrError + the 1057 predicate (tested)
├── context/ProfileContext.jsx        graph state + active profile in localStorage
├── components/
│   ├── Chrome.jsx                    masthead (incl. profile chip), footer, loading screen
│   ├── ProtectedRoute.jsx            waits out the PKCE exchange, then guards
│   ├── ProfileGate.jsx               holds authenticated viewers at /profiles
│   ├── Icons.jsx, BbcLogo.jsx        inline SVG
├── hooks/
│   ├── useBbcAuth.jsx                sign in/out, profile fetch, derived user
│   └── useSessionGuard.jsx           401 → forced sign-out
├── views/
│   ├── Home.jsx                      news shell; personalised when signed in
│   ├── Account.jsx                   account shell + section rail
│   ├── Profiles.jsx                  the gate UI
│   ├── SetupRequired.jsx             shown when apiKey is unset
│   ├── account/                      sections.jsx, LinkedAccounts.jsx, Fallbacks.jsx
│   └── profiles/                     AddProfileForm.jsx, gate.js (pure)
├── sdk/                              SdkWidget (theme scope + boundary), SDKBoundary
├── config/features.js                LOGIN_RADIUS_OPTIONS + missing-config detection
├── content/stories.js                placeholder editorial content
└── styles/bbc.css                    BBC theme + the --sdk-* mapping
```
