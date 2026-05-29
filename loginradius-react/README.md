<p align="center">
  <a href="https://www.loginradius.com" target="_blank" rel="noopener noreferrer">
    <img src="https://auth-dev.lrinternal.com/loginradius_favicon.svg" height="64" alt="LoginRadius logo" />
  </a>
</p>

<h1 align="center">LoginRadius React SDK Demos</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@loginradius/loginradius-react-sdk"><img src="https://img.shields.io/npm/v/@loginradius/loginradius-react-sdk.svg" alt="npm version" /></a>
  <a href="https://www.loginradius.com/docs"><img src="https://img.shields.io/badge/documentation-loginradius-blue.svg" alt="documentation" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
</p>

<p align="center">
  Reference apps that consume <a href="https://www.npmjs.com/package/@loginradius/loginradius-react-sdk"><code>@loginradius/loginradius-react-sdk</code></a> &mdash; the React-first SDK with first-class hooks and pre-built components, composed on top of <a href="https://www.npmjs.com/package/@loginradius/loginradius-core"><code>@loginradius/loginradius-core</code></a>.
</p>

<p align="center">
  Part of the <a href="../README.md">LoginRadius Demos</a> monorepo.
</p>

---

## 🧩 Demos in this directory

| Framework | Description | Link |
|---|---|---|
| Vite + React 19 | SPA with React Router, cookie session, and a separate `/user` profile route. | [`playground/`](./playground) |
| Next.js 16 | App Router client page wrapping `<Auth>` in `<LoginRadiusProvider>` &mdash; layout stays server-rendered. | [`next/`](./next) |

## What the React SDK gives you

- `<LoginRadiusProvider options={...}>` &mdash; wraps your tree, initializes the SDK, exposes it via React context.
- `useLoginRadiusSDK()` &mdash; returns `{ lrInstance, options, loading, content }` for any consumer below the provider.
- `useLRAuth()` &mdash; carries cross-step state (`email`, `phone`, `accessToken`, `mfaToken`, ...) between flow steps.
- `<AuthFlow />`, `<LoginFlow />`, `<RegisterFlow />`, `<ProfileFlow />` &mdash; pre-built orchestrators that read the flow registry and render the right step component for the user's current position.

Under the hood it composes [`@loginradius/loginradius-core`](../loginradius-core). Pick this package when you want the controller plus React UI for the standard auth flows.

---

## 🚀 Quick start

### Prerequisites

- Node.js **≥ 20.19**
- pnpm **≥ 10** (the repo uses a pnpm workspace; npm/yarn also work per individual demo)

Install once from the repo root, then run a demo:

```bash
# from the repo root
pnpm install

pnpm --filter @loginradius/demo-react-playground dev   # http://localhost:5000
pnpm --filter @loginradius/demo-react-next dev         # http://localhost:3000
```

Or treat any demo as a standalone project:

```bash
cd loginradius-react/playground   # or loginradius-react/next
pnpm install
cp .env.example .env.local
pnpm dev
```

### Configuration cheatsheet

| Demo | Env-var prefix | Env file | Default port |
|---|---|---|---|
| `playground` | `VITE_LOGINRADIUS_*` | `.env.local` | `5000` |
| `next` | `NEXT_PUBLIC_LOGINRADIUS_*` | `.env.local` | `3000` |

The variable **suffixes** are identical across demos: `API_KEY`, `SOTT`, `VERIFICATION_URL`, `RESET_PASSWORD_URL`, `CALLBACK_URL`, `LOCALIZATION`. See the per-demo README for the full list and footguns.

---

## 🏁 Learning LoginRadius

- Full docs at [loginradius.com/docs](https://www.loginradius.com/docs).
- Want pre-built UI without React-specific hooks? See [`../loginradius-js/`](../loginradius-js/).
- Building your own UI? See [`../loginradius-core/`](../loginradius-core/) for the controller-level building blocks.

## License

MIT.
