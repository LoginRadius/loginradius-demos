<p align="center">
  <a href="https://www.loginradius.com" target="_blank" rel="noopener noreferrer">
    <img src="https://auth-dev.lrinternal.com/loginradius_favicon.svg" height="64" alt="LoginRadius logo" />
  </a>
</p>

<h1 align="center">LoginRadius Core SDK &mdash; Playground</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@loginradius/loginradius-core"><img src="https://img.shields.io/npm/v/@loginradius/loginradius-core.svg" alt="npm version" /></a>
  <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/Vite-7-646cff.svg" alt="Vite 7" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.9-3178c6.svg" alt="TypeScript 5.9" /></a>
  <a href="https://www.loginradius.com/docs"><img src="https://img.shields.io/badge/documentation-loginradius-blue.svg" alt="documentation" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
</p>

<p align="center">
  A framework-agnostic Vite + TypeScript app that drives <code>@loginradius/loginradius-core</code> directly &mdash; schema-driven forms, controller-level auth calls, and a hand-rolled UI. The reference for building your own auth UX on top of the LoginRadius controller.
</p>

<p align="center">
  Part of the <a href="../../README.md">LoginRadius Demos</a> monorepo. The underlying package is <a href="https://www.npmjs.com/package/@loginradius/loginradius-core"><code>@loginradius/loginradius-core</code></a>.
</p>

---

## 🚀 Get started with LoginRadius

1. [Sign up for an account](https://accounts.loginradius.com/auth.aspx?return_url=https://dashboard.loginradius.com/login).
2. Create an application in your LoginRadius Dashboard and grab your **API Key** and **SOTT**.
3. Add `http://localhost:5001` to your app's **Allowed Domains** list (this demo runs on port **5001**, not the Vite default).

### Prerequisites

- Node.js **≥ 20.19**
- pnpm **≥ 10** (npm or yarn also work)

### Install

```bash
cd loginradius-core/playground
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
VITE_LOGINRADIUS_CALLBACK_URL=http://localhost:5001
```

> ⚠️ [`src/sdk.ts`](./src/sdk.ts) calls `requireEnv(...)` on `VITE_LOGINRADIUS_API_KEY` and `VITE_LOGINRADIUS_SOTT` &mdash; bootstrap throws an actionable error if either is missing.

### Run

```bash
pnpm dev      # vite dev server on http://localhost:5001
pnpm build    # production bundle into dist/
pnpm preview  # serve the production build on http://localhost:4301
```

---

## 🧩 What this demo shows

- A single async `bootstrap()` in [`src/main.ts`](./src/main.ts) that calls `initSDK()`, wires three independent flow modules, then resumes any cached session from `localStorage`.
- [`src/sdk.ts`](./src/sdk.ts) calling `LoginRadiusCore.createLoginRadius(options)` with env-validated options and `debugMode: import.meta.env.DEV` &mdash; debug logging is dev-only by construction.
- Per-flow modules under [`src/flows/`](./src/flows/) that own one journey each: email-availability + sign-in ([`login.ts`](./src/flows/login.ts)), registration ([`signup.ts`](./src/flows/signup.ts)), and authenticated profile + sign-out ([`profile.ts`](./src/flows/profile.ts)).
- Schema-driven form rendering: `lr.getSchema('loginFormSchema' | 'registrationFormSchema', content)` feeds [`src/schemaForm.ts`](./src/schemaForm.ts), which maps schema field types (`input` / `email` / `password` / `checkbox` / `select`) to DOM inputs &mdash; the tenant config drives the UI.
- A `(payload, onSuccess, onError)` callback shape on every `controller.*` method (`login`, `register`, `checkEmailAvailability`, `getAccount`, `ssoLogout`).
- Token-expiry handling in [`flows/profile.ts`](./src/flows/profile.ts): `errorCode === 905` clears `localStorage` and returns the user to the email screen &mdash; no redirect loops.

---

## 🛠 Troubleshooting

| Symptom | Likely cause & fix |
|---|---|
| `Missing required environment variable: VITE_LOGINRADIUS_*` | `.env.local` not present or var name missing the `VITE_` prefix. Restart the dev server after editing. |
| `loginFormSchema unavailable, using fallback` | Tenant template config isn't provisioned; the static password field is rendered instead. Safe to ignore for the demo. |
| Stuck on the profile spinner with `errorCode 905` | Expired access token. The app clears it automatically and returns to sign-in. |
| `401` / CORS error in the Network tab | Add `http://localhost:5001` to **Allowed Domains**. |
| `debugMode` chatter in production console | `import.meta.env.DEV` should be `false` in prod builds &mdash; verify you ran `pnpm build`, not `pnpm dev`. |

---

## 🏁 Learning LoginRadius

The full LoginRadius documentation lives at [loginradius.com/docs](https://www.loginradius.com/docs).

- New to LoginRadius? Start with the [quickstart guides](https://www.loginradius.com/docs/).
- Want the same flows from a `<script>` tag with no bundler? See [`loginradius-core/vanilla/`](../vanilla/).
- Don't want to hand-roll the UI? Use [`loginradius-js/`](../../loginradius-js/) (pre-built UI on top of the same controller) or [`loginradius-react/`](../../loginradius-react/) (React hooks + components).

---

## 🛟 Release notes

Curious what shipped recently? Browse the [`@loginradius/loginradius-core` releases](https://www.npmjs.com/package/@loginradius/loginradius-core?activeTab=versions) on npm.

---

## License

MIT.
