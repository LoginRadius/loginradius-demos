# BBC B2C demo — LoginRadius React SDK

A consumer-facing demo of the **B2C** path through `@loginradius/loginradius-react`:
hosted OIDC sign-in over authorization code + PKCE, a personalised home page, a
BBC-styled account area built from the SDK's profile widgets, and a Linked accounts
section reading the `link_account` custom object through this app's own server.

**Next.js App Router.** The framework choice is load-bearing: reading the account
graph needs a Machine-to-Machine token, and minting one needs the M2M client secret.
That secret lives in a route handler (`src/app/api/linked-accounts/route.js`) and
never reaches the browser.

Companion to `../helix-demo`, which shows the **B2B** path (org context, admin portal,
`piam/Organization*` widgets). This one deliberately has none of that.

> Not affiliated with or endorsed by the BBC. The branding stands in for a real
> consumer property so the identity flow can be seen in a realistic context.

See [FEATURES.md](./FEATURES.md) for a technical walkthrough of every
implemented feature — flows, data model, decisions and known limitations.

## Setup

```bash
cp .env.example .env.local     # fill in your tenant values
pnpm install
pnpm dev                       # http://localhost:5174
pnpm test                      # shaping tests for the link_account payloads
```

Requires Node 22 (`nvm use 22`) — pnpm 11 fails to launch on Node 20 here.

Register `http://localhost:5174/account` as an allowed redirect URI on the OIDC app,
or the authorize call is rejected.

### The tenant must be B2C

`isB2BEnabled` is not a local flag — the SDK reads `IsB2BEnabled` from the tenant's app
config (`mapOptions.ts`). On a B2C tenant `LoginRadiusProvider` writes the PKCE access
token into the standard token cache, which is what makes `useLRAuth().isAuthenticated`
true and lets the profile widgets work. Point this at a B2B tenant and the token lands
in the org session instead, and the account page never sees you as signed in.

### SDK stylesheets

The SDK injects its own stylesheet at runtime — a `<style>` element built from
the tenant's branding, not a file you import — so the profile widgets are styled
without any CSS import on your side.

That sheet carries a blanket reset:

```css
button, input, select, textarea { appearance: none; border: none; background: transparent }
```

It applies to *every* control on the page, not just the SDK's own. Any native
control this app renders has to opt back in explicitly — see
`.profile-check input[type="checkbox"]` in `bbc.css`, which would otherwise
reserve its box and paint nothing.

### Which SDK build

`package.json` pins the published package:

```
@loginradius/loginradius-react  3.0.1   (GitHub Packages)
```

That build bakes **prod** defaults — `%s.hub.loginradius.com` for the hub — and bundles
`loginradius-core` inline, externalising only React. It contains no surviving
`import.meta.env`, which is why it drops into Next's build cleanly.

To develop against the SDK source instead, swap in `link:` paths to
`../loginradius-pages/packages/{loginradius-react,loginradius-core,loginradius-ui}`,
build them at the monorepo root (`pnpm dev`), and add all three to
`transpilePackages` in `next.config.mjs`. Those builds bake dev defaults
(`%s.devhub.lrinternal.com`, `config-dev.lrinternal.com`), so the hub changes with them
— see the next section.

### The hub domain and the SSO CORS trap

Every hub call — `/ssologin/login` on init, `/ssologin/logout` on sign-out, `setToken` —
goes to a domain resolved in this order:

1. `customDomain` passed in provider options (this app sets it from `NEXT_PUBLIC_AUTH_DOMAIN`),
2. else `appConfig.CustomDomain` from the tenant's own config (`mapOptions.ts:229`),
3. else the domain baked into the installed SDK build — the published 3.0.1 package
   bakes **prod** (`%s.hub.loginradius.com`), a local monorepo build bakes dev.

So the hub you hit may have nothing to do with your `.env.local`, and if that domain's
allow-list doesn't include your dev origin, the calls fail CORS: the hub answers
204/200 but omits `Access-Control-Allow-Origin`, so the browser blocks the response.

Fix by setting `NEXT_PUBLIC_AUTH_DOMAIN` (wins over both fallbacks), or by whitelisting
your origin on the tenant behind whichever domain you want to use.
`skipCheckSession: true` only silences the init call — sign-out still hits the hub — so
it isn't a fix. To check an origin without a browser:

```bash
curl -sI https://<hub-domain>/ssologin/login -H 'Origin: http://localhost:5174' | grep -i access-control-allow-origin
```

No line back means that origin isn't allowed.

The SDK's Vite library build strips its own CSS imports, so `src/main.jsx` loads
`loginradius-core/styles/index.css` and `loginradius-ui/styles` explicitly. Without
them every widget renders unstyled.

## The flow

1. `/` — signed out, the sign-in panel calls `pkceLogin.getAuthorizeEndpoint()`. The SDK
   generates the verifier, stores it in `sessionStorage`, and returns an authorize URL
   carrying `code_challenge` + `S256`. Any params already on the page (`?vtype=…&vtoken=…`
   from a verification email) are forwarded onto it.
2. The hosted BBC account service authenticates the user and redirects to `/account?code=…`.
3. `LoginRadiusProvider` redeems the code, and — because this is B2C — also writes the
   access token to the standard cache. `ProtectedRoute` waits on `useLRAuth().loading`,
   which stays true until that exchange finishes.
4. `/account` composes the SDK's profile widgets inside BBC card chrome.

## What B2C does and doesn't give you

Verified against the SDK source, not the docs:

| | |
|---|---|
| `pkceLogin.getAuthorizeEndpoint()` / `.login()` | Work. Not gated by B2B. |
| `pkceLogin.isAuthenticated` / `.tenantAccessToken` / `.profile` / `.logout` / `.refreshTenant` | **Always empty on B2C.** `useLRAuth` nulls the tenant session whenever `isB2BEnabled` is false. Use the top-level `isAuthenticated` / `accessToken` / `logout` instead. |
| `useLRAuth().user` | **Always null** — the hook never calls its own setter. Read the profile from `useLoginRadiusSDK().profileData`. |
| Token renewal | **None.** The OIDC `refresh_token` is written to the org snapshot, but the React refresh path is B2B-gated. The session ends when the access token expires — see `useSessionGuard`. |
| `OrgContextProvider`, `piam/Organization*`, `AdminPortal`, `RequireOrg`, `ScopeGate` | B2B only. `useOrgContext` throws outside its provider. |
| `Profile` and every profile sub-widget | B2C-safe, no org coupling. |

Sub-widgets self-gate on tenant config — phone needs `phoneLogin`, passkey needs
`isPassKeysEnabled`, MFA needs `twoFactorAuthentication`, social needs configured
providers plus a verified email, and so on. Anything disabled renders its fallback copy.

## Layout

```
src/
├── app/                          App Router
│   ├── layout.jsx                server; global CSS + <Providers>
│   ├── providers.jsx             client; LoginRadiusProvider via dynamic(ssr:false)
│   ├── page.jsx                  /
│   ├── account/page.jsx          /account — OIDC redirect URI, guarded, Suspense
│   └── api/linked-accounts/route.js   holds the M2M secret
├── server/                       server-only; never imported from a client component
│   ├── loginradius.js            M2M token cache + management fetch + token→identity
│   ├── linkedAccounts.js         I/O: fetch object, resolve each link
│   └── shapeAccountGraph.js      pure shaping (no I/O — this is what tests cover)
├── views/                        page bodies (was src/pages — renamed: a src/pages
│   │                             directory would switch Next to the Pages Router)
│   ├── Home.jsx, Account.jsx, SetupRequired.jsx
│   └── account/                  sections.jsx, LinkedAccounts.jsx, Fallbacks.jsx
├── components/                   Chrome, ProtectedRoute, Icons, BbcLogo
├── hooks/                        useBbcAuth, useSessionGuard
├── sdk/                          SdkWidget (theme scope + boundary), SDKBoundary
└── styles/bbc.css                BBC theme + the --sdk-* mapping
```

## Linked accounts

`/api/linked-accounts` returns the signed-in user's account graph:

1. The browser sends its **own** LoginRadius access token.
2. The server resolves it to an identity via `GET /identity/v2/auth/account`. The uid
   is never taken from the request — a client could otherwise name any uid and read
   someone else's graph.
3. It mints (and caches, single-flighted, ~60s before expiry) an M2M token via
   `POST https://<hub>/service/oauth/token` with `grant_type=client_credentials`.
4. It reads `GET /identity/v2/manage/account/{uid}/customobject?objectname=link_account`
   and resolves each `LinkedAccounts[].ReferenceId` to an account, in parallel and with
   `allSettled` so one unreadable link degrades a single row.

`LinkType` names the *other* end of the link, so an identity holding `child` entries is
itself a parent. `Profiles[]` lives on the parent's record. Both are covered by
`pnpm test` against the real payload shapes, including the no-record and
malformed-entry cases.

### Adding a profile

`POST /api/linked-accounts` appends to `CustomObject.Profiles[]`. There is no
append operation on the API, so it is a read-modify-write:

1. Validate and normalise the body (`src/server/profiles.js`). Booleans are
   coerced rather than passed through, so a form's `"false"` string can't land
   in the object as a truthy value.
2. Read the current object. An identity whose links are all `LinkType: "parent"`
   is a child account and is refused — profiles belong to the guardian's record.
3. Build the record in the stored PascalCase shape, with a ULID-shaped
   `prf_01H…` id matching the ids already in the object (time-prefixed, so ids
   sort by creation).
4. Append, enforcing the cap (`LOGINRADIUS_PROFILE_CAP`, default 20) and
   rejecting a duplicate display name.
5. Write: `POST …/customobject` when no record exists yet, otherwise
   `PUT …/customobject/{objectrecordid}` with `updateType=partialreplace` and a
   body of just `{ Profiles: [...] }`. `partialreplace` is an upsert over
   top-level keys, so `LinkedAccounts` survives untouched even if our read of it
   was stale; `replace` would swap the whole object and drop anything we didn't
   send.
6. Re-read and return the fresh graph, so the UI renders what was stored rather
   than optimistic local state.

**Known limitation:** the endpoint has no ETag or If-Match, so two adds racing
on the same identity can lose one of the writes. Fine for a single-user demo; a
production owner service would serialise writes per uid.

The two API references disagree on the casing of the update query parameter
(`updateType` in OpenAPI, `updatetype` in the v2 reference), so both are sent
with the same value.

Reads and profile-add are implemented; editing, deleting and linking accounts
are not.

### Theming the widgets

`LoginRadiusCore` writes its `--sdk-*` values as **inline styles on `<html>`** at init,
so a `:root` override in CSS loses to them. `.bbc-sdk-scope` redeclares those custom
properties on a wrapper element instead, which wins for its subtree. That class is the
whole BBC theming layer for the SDK — see the bottom of `src/styles/bbc.css`.

`VITE_USE_SDK=false` swaps every widget for a static fallback, so the chrome can be
reviewed without a live tenant.

## Secrets

`.env.local` is gitignored and so is `.npmrc`. Nothing here needs a registry token — the
SDK comes from the local checkout. Don't paste keys into chat or commits.
