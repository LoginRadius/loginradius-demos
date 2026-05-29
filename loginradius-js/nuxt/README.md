<p align="center">
  <a href="https://www.loginradius.com" target="_blank" rel="noopener noreferrer">
    <img src="https://auth-dev.lrinternal.com/loginradius_favicon.svg" height="64" alt="LoginRadius logo" />
  </a>
</p>

<h1 align="center">LoginRadius JS SDK &mdash; Nuxt Demo</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@loginradius/loginradius-js"><img src="https://img.shields.io/npm/v/@loginradius/loginradius-js.svg" alt="npm version" /></a>
  <a href="https://nuxt.com"><img src="https://img.shields.io/badge/Nuxt-4-00dc82.svg" alt="Nuxt 4" /></a>
  <a href="https://vuejs.org"><img src="https://img.shields.io/badge/Vue-3-42b883.svg" alt="Vue 3" /></a>
  <a href="https://ui.nuxt.com"><img src="https://img.shields.io/badge/Nuxt%20UI-4-00dc82.svg" alt="Nuxt UI 4" /></a>
  <a href="https://www.loginradius.com/docs"><img src="https://img.shields.io/badge/documentation-loginradius-blue.svg" alt="documentation" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
</p>

<p align="center">
  A reference integration that mounts the LoginRadius pre-built auth UI inside a Nuxt&nbsp;4 app, with a dynamic <code>import()</code> in <code>onMounted</code> keeping the browser-only SDK out of the SSR bundle.
</p>

<p align="center">
  Part of the <a href="../../README.md">LoginRadius Demos</a> monorepo. The underlying package is <a href="https://www.npmjs.com/package/@loginradius/loginradius-js"><code>@loginradius/loginradius-js</code></a>.
</p>

---

## 🚀 Get started with LoginRadius

1. [Sign up for an account](https://accounts.loginradius.com/auth.aspx?return_url=https://dashboard.loginradius.com/login).
2. Create an application in your LoginRadius Dashboard and grab your **API Key** and **SOTT**.
3. Add `http://localhost:3000` to your app's **Allowed Domains** list.

### Prerequisites

- Node.js **≥ 20.19**
- pnpm **≥ 10** (npm or yarn also work)

### Install

```bash
cd loginradius-js/nuxt
pnpm install
```

### Configure

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

```env
NUXT_PUBLIC_LOGINRADIUS_API_KEY=your-api-key
NUXT_PUBLIC_LOGINRADIUS_SOTT=your-sott
```

> ⚠️ Nuxt maps `NUXT_PUBLIC_*` onto `runtimeConfig.public` automatically. The keys are read via `useRuntimeConfig().public.loginradiusApiKey` and `.loginradiusSott` — see [`nuxt.config.ts`](./nuxt.config.ts) for the wiring.

### Run

```bash
pnpm dev      # nuxt dev on http://localhost:3000
pnpm build    # nuxt build (Nitro server output)
pnpm preview  # nuxt preview the production build
```

---

## 🧩 What this demo shows

- A `<script setup>` block in [`app/app.vue`](./app/app.vue) that `await import('@loginradius/loginradius-js')` **inside** `onMounted`, so the SDK never executes during SSR (no `window`/`document` access on the server).
- `useRuntimeConfig()` (the Nuxt-idiomatic env reader) rather than `process.env.*` at module scope.
- The login UI mounted into `#auth-container` declared in the SFC `<template>` via `loginRadius.init('auth', { container, onSuccess, onError })`.
- `useHead` + `useSeoMeta` composables setting page metadata, illustrating how the auth island composes with the rest of a Nuxt page.
- Tailwind CSS v4 + Nuxt UI 4 in the dev dependencies — available for theming the surrounding shell without touching the SDK's own styles.

---

## 🛠 Troubleshooting

| Symptom | Likely cause & fix |
|---|---|
| `config.public.loginradiusApiKey` is `undefined` | Env var missing the `NUXT_PUBLIC_` prefix, or the key doesn't match `nuxt.config.ts`. Restart `nuxt dev` after editing `.env`. |
| `ReferenceError: window is not defined` during build | The SDK import escaped `onMounted` — a top-level `import` runs during SSR. Move it back to the dynamic `import()` inside the lifecycle hook. |
| `401` / CORS error from LoginRadius | Add `http://localhost:3000` to your app's **Allowed Domains**. |
| `Port 3000 already in use` | Run on a different port: `pnpm dev -- --port 3001`. |
| Hydration mismatch on the auth container | Don't render SDK-controlled DOM inside `<ClientOnly>` and `<template>` simultaneously; keep `#auth-container` as a plain empty div and let `onMounted` populate it. |

---

## 🏁 Learning LoginRadius

The full LoginRadius documentation lives at [loginradius.com/docs](https://www.loginradius.com/docs).

- New to LoginRadius? Start with the [quickstart guides](https://www.loginradius.com/docs/).
- Looking for other frameworks? Browse the sibling demos under [`loginradius-js/`](../) (Next.js, Vue, Svelte, Solid, Angular, Vanilla, Playground).
- Building with React components instead of the pre-built UI? See [`loginradius-react/`](../../loginradius-react/).

---

## 🛟 Release notes

Curious what shipped recently? Browse the [`@loginradius/loginradius-js` releases](https://www.npmjs.com/package/@loginradius/loginradius-js?activeTab=versions) on npm.

---

## License

MIT.
