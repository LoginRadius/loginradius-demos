# Helix Demo — LoginRadius Partner IAM (B2B)

A production-ready Vite + React demo that integrates the LoginRadius React SDK with a real OIDC PKCE login flow and renders the full Partner IAM admin portal (Users, Roles, Connections, SCIM, Security, Domains, Invitations, Settings, Danger Zone).

## Stack

- **Vite** + **React 19** (JavaScript, no TypeScript)
- **react-router-dom v7**
- **@loginradius/loginradius-react-sdk** (workspace-linked to the local SDK in `../loginradius-pages/packages/`)
- **Geist / Geist Mono** via Google Fonts

## Setup

```bash
# Build the SDK once (peer to this demo)
pnpm -C ../loginradius-pages/packages/loginradius-react-sdk run build
pnpm -C ../loginradius-pages/packages/lr-core-js run build

# Install demo deps
cd helix-demo
pnpm install

# Copy environment template and fill in real values from your LoginRadius dashboard
cp .env.example .env.local

# Start dev server
pnpm dev
```

Open <http://localhost:5173>. Sign in via the OIDC button — the SDK redirects to the LoginRadius identity provider and returns to `/admin` with an authenticated session.

## Required environment variables

| Variable | Purpose |
|---|---|
| `VITE_LOGINRADIUS_API_KEY` | LoginRadius app API key |
| `VITE_LOGINRADIUS_OIDC_APP_NAME` | OIDC application name configured in LoginRadius |
| `VITE_LOGINRADIUS_CLIENT_ID` | OIDC client ID for the B2B app |

> Never commit `.env.local`. Never paste real secrets into chat or pastes.

## Project layout

```
src/
├── App.jsx                  LoginRadiusProvider + routes
├── main.jsx                 entry
├── index.css                design tokens + layout (from the Helix mockup)
├── config/
│   └── features.js          USE_SDK feature flag
├── components/              Sidebar, Header, OrgSwitcher, icons, primitives
├── layouts/
│   └── AdminLayout.jsx      protected layout (sidebar + header + outlet)
├── pages/
│   ├── Home.jsx             OIDC PKCE login screen
│   └── admin/               Dashboard, Users, Roles, …
├── routes/
│   └── ProtectedRoute.jsx   auth guard for /admin/*
├── sdk/                     thin wrappers around SDK widgets with mock fallback
└── services/
    ├── mockData.js          Northwind Cloud demo data
    ├── userService.js
    └── roleService.js
```

## OIDC PKCE flow

`/home` (or `/`) renders the sign-in screen. Clicking **Sign in** calls:

```js
const { pkceLogin } = useLRAuth();
const url = await pkceLogin.getAuthorizeEndpoint();
window.location.href = url;
```

After the identity provider authenticates, it redirects to `oidcRedirectUri` (`window.location.origin + "/admin"`). The SDK consumes the OIDC parameters on mount; `useLRAuth().isAuthenticated` then flips to `true` and the protected layout renders.

## Feature flag

`src/config/features.js` exports `USE_SDK`. When `false`, every `/admin/*` page renders the mock UI from `services/*Service.js`. When `true`, the mock UI is replaced by the corresponding SDK widget under `sdk/`. If a widget throws or the org context is missing, the wrapper falls back to the mock UI so the layout never breaks.
