<p align="center">
  <a href="https://www.loginradius.com" target="_blank" rel="noopener noreferrer">
    <img src="https://auth-dev.lrinternal.com/loginradius_favicon.svg" height="64" alt="LoginRadius logo" />
  </a>
</p>

<h1 align="center">LoginRadius JS SDK &mdash; Vue Demo</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@loginradius/loginradius-js"><img src="https://img.shields.io/npm/v/@loginradius/loginradius-js.svg" alt="npm version" /></a>
  <a href="https://vuejs.org"><img src="https://img.shields.io/badge/Vue-3.5-42b883.svg" alt="Vue 3.5" /></a>
  <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/Vite-7-646cff.svg" alt="Vite 7" /></a>
  <a href="https://www.loginradius.com/docs"><img src="https://img.shields.io/badge/documentation-loginradius-blue.svg" alt="documentation" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
</p>

<p align="center">
  A reference integration that mounts the LoginRadius pre-built auth UI inside a Vue&nbsp;3 <code>&lt;script setup&gt;</code> SFC, using <code>onMounted</code> so init runs once the template's <code>#auth-container</code> is in the DOM.
</p>

<p align="center">
  Part of the <a href="../../README.md">LoginRadius Demos</a> monorepo. The underlying package is <a href="https://www.npmjs.com/package/@loginradius/loginradius-js"><code>@loginradius/loginradius-js</code></a>.
</p>

---

## 🚀 Get started with LoginRadius

1. [Sign up for an account](https://accounts.loginradius.com/auth.aspx?return_url=https://dashboard.loginradius.com/login).
2. Create an application in your LoginRadius Dashboard and grab your **API Key** and **SOTT**.
3. Add `http://localhost:5173` to your app's **Allowed Domains** list.

### Prerequisites

- Node.js **^20.19 || ≥22.12** (matches the `engines` field in [`package.json`](./package.json))
- pnpm **≥ 10** (npm or yarn also work)

### Install

```bash
cd loginradius-js/vue
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
```

> ⚠️ The `VITE_` prefix is **required** &mdash; Vite only exposes prefixed vars on `import.meta.env`.

### Run

```bash
pnpm dev      # vite dev server on http://localhost:5173
pnpm build    # vite build (output in dist/)
pnpm preview  # preview the production build
```

---

## 🧩 What this demo shows

- A `<script setup>` SFC at [`src/App.vue`](./src/App.vue) using the Composition API &mdash; no Options API, no `Vue.component`.
- `onMounted` from `vue` wrapping the SDK instantiation, so `#auth-container` (declared in the same SFC's `<template>`) exists when `init` runs.
- `apiKey` and `sott` read from `import.meta.env.VITE_*` inside the callback &mdash; deliberately not at module scope, to keep all SDK side effects scoped to the lifecycle.
- The login UI mounted into `#auth-container` via `loginRadius.init('auth', { container, onSuccess, onError })`.
- `vite-plugin-vue-devtools` enabled in dev dependencies for inspecting component state during integration debugging.

---

## 🛠 Troubleshooting

| Symptom | Likely cause & fix |
|---|---|
| `apiKey is undefined` | `.env.local` missing or vars not prefixed `VITE_`. Restart the dev server after edits. |
| HMR re-runs `onMounted` and double-mounts the SDK | Open the page in a fresh tab after large edits; Vue HMR can re-create components mid-session. The SDK is idempotent on the same container, but verify with the console. |
| Init runs before `#auth-container` exists | Keep the SDK call **inside** `onMounted`, not at the top of `<script setup>` (which runs before mount). |
| `401` / CORS error from LoginRadius | Add `http://localhost:5173` to your app's **Allowed Domains**. |
| `Port 5173 already in use` | Pass `--port 5174` to `pnpm dev`. |

---

## 🏁 Learning LoginRadius

The full LoginRadius documentation lives at [loginradius.com/docs](https://www.loginradius.com/docs).

- New to LoginRadius? Start with the [quickstart guides](https://www.loginradius.com/docs/).
- Looking for other frameworks? Browse the sibling demos under [`loginradius-js/`](../) (Next.js, Nuxt, Svelte, Solid, Angular, Vanilla, Playground).
- Building with React components instead of the pre-built UI? See [`loginradius-react/`](../../loginradius-react/).
- Using Vue inside Nuxt? The [`nuxt/`](../nuxt/) demo wraps the same SDK with `useRuntimeConfig` and SSR-safe imports.

---

## 🛟 Release notes

Curious what shipped recently? Browse the [`@loginradius/loginradius-js` releases](https://www.npmjs.com/package/@loginradius/loginradius-js?activeTab=versions) on npm.

---

## License

MIT.
