<p align="center">
  <a href="https://www.loginradius.com" target="_blank" rel="noopener noreferrer">
    <img src="https://auth-dev.lrinternal.com/loginradius_favicon.svg" height="64" alt="LoginRadius logo" />
  </a>
</p>

<h1 align="center">LoginRadius React SDK &mdash; React</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@loginradius/loginradius-react-sdk"><img src="https://img.shields.io/npm/v/@loginradius/loginradius-react-sdk.svg" alt="npm version" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19.2-61dafb.svg" alt="React 19.2" /></a>
  <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/Vite-7-646cff.svg" alt="Vite 7" /></a>
  <a href="https://reactrouter.com"><img src="https://img.shields.io/badge/React%20Router-6-ca4245.svg" alt="React Router 6" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.9-3178c6.svg" alt="TypeScript 5.9" /></a>
  <a href="https://www.loginradius.com/docs"><img src="https://img.shields.io/badge/documentation-loginradius-blue.svg" alt="documentation" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
</p>

<p align="center">
  A Vite + React SPA that mounts the LoginRadius <code>&lt;Auth&gt;</code> flow at <code>/</code> and a profile view at <code>/user</code>, demonstrating end-to-end auth with the React SDK alongside React Router and cookie-backed session state.
</p>

<p align="center">
  Part of the <a href="../../README.md">LoginRadius Demos</a> monorepo. The underlying package is <a href="https://www.npmjs.com/package/@loginradius/loginradius-react-sdk"><code>@loginradius/loginradius-react-sdk</code></a>.
</p>

---

## 🚀 Get started with LoginRadius

1. [Sign up for an account](https://accounts.loginradius.com/auth.aspx?return_url=https://dashboard.loginradius.com/login).
2. Create an application in your LoginRadius Dashboard and grab your **API Key** and **SOTT**.
3. Add `http://localhost:5000` to your app's **Allowed Domains** list (note: this demo runs on port **5000**, not the Vite default 5173 &mdash; see [`vite.config.ts`](./vite.config.ts)).

### Prerequisites

- Node.js **≥ 20.19**
- pnpm **≥ 10** (npm or yarn also work)

### Install

```bash
cd loginradius-react/react
pnpm install
```

### Configure

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env.local
```

```env
VITE_LOGINRADIUS_API_KEY=your-api-key
VITE_LOGINRADIUS_SOTT=your-sott
VITE_LOGINRADIUS_VERIFICATION_URL=https://your-tenant.example.com/auth.aspx
VITE_LOGINRADIUS_RESET_PASSWORD_URL=https://your-tenant.example.com/auth.aspx
VITE_LOGINRADIUS_CALLBACK_URL=http://localhost:5000
VITE_LOGINRADIUS_LOCALIZATION=true
```

> ⚠️ Only variables prefixed with `VITE_` are exposed on `import.meta.env`. Restart `pnpm dev` after editing.

### Run

```bash
pnpm dev      # vite dev server on http://localhost:5000
pnpm build    # tsc -b && vite build (output in dist/)
pnpm preview  # serve the production build on http://localhost:4300
```

---

## 🧩 What this demo shows

- [`src/main.tsx`](./src/main.tsx) wraps the entire router tree in `<LoginRadiusProvider>`, reading config from `import.meta.env.VITE_LOGINRADIUS_*` &mdash; the React SDK initializes once at the app root, not per-route.
- An `onLoading` prop on the provider toggles a `#my-loader` DOM element &mdash; useful when the loader sits outside the React tree (e.g. in `index.html`).
- An optional `?brand=<templateName>` query param is forwarded into `templateName` so a single deploy can switch branding at runtime.
- [`src/app/app.tsx`](./src/app/app.tsx) renders the combined `<Auth>` flow component, which the SDK drives through login → register → MFA → verification steps based on tenant config.
- `onSuccess` checks for `access_token` then `useNavigate('/user')` transitions to the profile route &mdash; the canonical pattern for integrating the SDK with React Router.
- The `/user` route renders [`src/app/Components/Sdkprofile.tsx`](./src/app/Components/Sdkprofile.tsx), which consumes `useLoginRadiusSDK()` to call `controller.getAccount(...)` and persists state via `js-cookie`.

---

## 🛠 Troubleshooting

| Symptom | Likely cause & fix |
|---|---|
| Blank screen / `apiKey is required` | `.env.local` missing or vars not prefixed `VITE_`. Restart the dev server after edits. |
| `401` / CORS from `api.loginradius.com` | Add `http://localhost:5000` to **Allowed Domains** &mdash; this demo's port differs from Vite's default. |
| `/user` returns 404 on refresh in production | Configure your host to fall back to `index.html` for client-side routes (SPA fallback). |
| `Port 5000 already in use` | Either free the port or change `server.port` in [`vite.config.ts`](./vite.config.ts) and update `VITE_LOGINRADIUS_CALLBACK_URL` + Allowed Domains to match. |
| Cookies not persisting across reloads | `js-cookie` defaults to session cookies; pass `{ expires: 7 }` when setting if you need persistence. |

---

## 🏁 Learning LoginRadius

The full LoginRadius documentation lives at [loginradius.com/docs](https://www.loginradius.com/docs).

- New to LoginRadius? Start with the [quickstart guides](https://www.loginradius.com/docs/).
- Building on Next.js instead of Vite? See [`loginradius-react/next/`](../next/).
- Need the pre-built UI without React hooks? See [`loginradius-js/`](../../loginradius-js/) for framework-agnostic alternatives.

---

## 🛟 Release notes

Curious what shipped recently? Browse the [`@loginradius/loginradius-react-sdk` releases](https://www.npmjs.com/package/@loginradius/loginradius-react-sdk?activeTab=versions) on npm.

---

## License

MIT.
