<p align="center">
  <a href="https://www.loginradius.com" target="_blank" rel="noopener noreferrer">
    <img src="https://auth-dev.lrinternal.com/loginradius_favicon.svg" height="64" alt="LoginRadius logo" />
  </a>
</p>

<h1 align="center">LoginRadius Core SDK Demos</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@loginradius/loginradius-core"><img src="https://img.shields.io/npm/v/@loginradius/loginradius-core.svg" alt="npm version" /></a>
  <a href="https://www.loginradius.com/docs"><img src="https://img.shields.io/badge/documentation-loginradius-blue.svg" alt="documentation" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
</p>

<p align="center">
  Reference apps that consume <a href="https://www.npmjs.com/package/@loginradius/loginradius-core"><code>@loginradius/loginradius-core</code></a> &mdash; the framework-agnostic core. Use these as a starting point if you're building your own UI on top of the LoginRadius auth controller, flow registry, and schemas.
</p>

<p align="center">
  Part of the <a href="../README.md">LoginRadius Demos</a> monorepo.
</p>

---

## 🧩 Demos in this directory

| Framework | Description | Link |
|---|---|---|
| Vanilla HTML | Static `<script>` tag from `auth.lrcontent.com`. The simplest possible drop-in &mdash; no bundler. | [`vanilla/`](./vanilla) |
| Vite + TypeScript | Schema-driven playground exercising `controller.*` calls (login, register, MFA, profile). | [`playground/`](./playground) |

## What the Core SDK gives you

- `LoginRadiusCore.createLoginRadius(options)` &mdash; async init that fetches tenant config and branding before any controller calls.
- `lr.controller.login(...)` / `register(...)` / `forgotPassword(...)` / `getAccount(...)` / `ssoLogout(...)` &mdash; the full auth API surface, all using a `(payload, onSuccess, onError)` callback shape.
- `flowRegistry` &mdash; definition of every auth step (login, MFA, OTP, ...) with `getNext` / `handleError` / `handleBack`.
- `SCHEMAS` + `lr.getSchema(name, content)` &mdash; pre-defined field definitions for every form, so your hand-rolled UI can render the right inputs in the right order.
- `apiClient` &mdash; low-level HTTP layer that handles SOTT headers and error mapping.

There's no UI here &mdash; bring your own framework and components, or use [`@loginradius/loginradius-js`](../loginradius-js) for an all-in-one bundle.

---

## 🚀 Quick start

### Prerequisites

- Node.js **≥ 20.19**
- pnpm **≥ 10** (the repo uses a pnpm workspace; npm/yarn also work per individual demo)

Install once from the repo root, then run the playground:

```bash
# from the repo root
pnpm install
pnpm --filter @loginradius/demo-core-playground dev   # http://localhost:5001
```

Or treat the playground as a standalone project:

```bash
cd loginradius-core/playground
pnpm install
cp .env.example .env.local
pnpm dev
```

For the vanilla demo, no install is needed &mdash; open `vanilla/index.html` in a browser (or `npx serve loginradius-core/vanilla`) after replacing the placeholder `apiKey` / `sott`.

### Configuration

Both demos require:

| Field | Where to get it |
|---|---|
| `apiKey` | LoginRadius Admin Console → App Settings |
| `sott` | Generated via the Admin Console or the `/sott` API endpoint |
| `verificationUrl` *(optional)* | The URL users land on after clicking an email-verification link |
| `resetPasswordUrl` *(optional)* | The URL for password-reset links |
| `callbackUrl` *(optional)* | Where social-login redirects land (defaults to `window.location.origin`) |

In the playground, set these via `.env.local` (Vite-prefixed). In the vanilla demo, edit the inline `LoginRadiusCore` constructor in `index.html` and `profile.html`. The per-demo README has the full list.

---

## 🏁 Learning LoginRadius

- Full docs at [loginradius.com/docs](https://www.loginradius.com/docs).
- Want pre-built UI on top of the same controller? See [`../loginradius-js/`](../loginradius-js/).
- Building in React with hooks and components? See [`../loginradius-react/`](../loginradius-react/).

## License

MIT.
