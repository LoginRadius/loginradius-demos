<p align="center">
  <a href="https://www.loginradius.com" target="_blank" rel="noopener noreferrer">
    <img src="https://auth-dev.lrinternal.com/loginradius_favicon.svg" height="64" alt="LoginRadius logo" />
  </a>
</p>

<h1 align="center">LoginRadius JS SDK Demos</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@loginradius/loginradius-js"><img src="https://img.shields.io/npm/v/@loginradius/loginradius-js.svg" alt="npm version" /></a>
  <a href="https://www.loginradius.com/docs"><img src="https://img.shields.io/badge/documentation-loginradius-blue.svg" alt="documentation" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
</p>

<p align="center">
  Reference apps that consume <a href="https://www.npmjs.com/package/@loginradius/loginradius-js"><code>@loginradius/loginradius-js</code></a> &mdash; a single-bundle SDK that ships the LoginRadius pre-built auth UI on top of the auth controller. Drop it into any frontend and call <code>sdk.init('auth', { container: '#my-div' })</code>.
</p>

<p align="center">
  Part of the <a href="../README.md">LoginRadius Demos</a> monorepo.
</p>

---

## 🧩 Demos in this directory

| Framework | Description | Link |
|---|---|---|
| Vanilla HTML | Zero-build, CDN `<script>` &mdash; the minimum viable integration. | [`vanilla/`](./vanilla) |
| Playground | Vite + TypeScript sandbox with a Preact-compat alias for the smallest bundle. | [`playground/`](./playground) |
| Angular 21 | Standalone-component demo initializing the SDK in `ngOnInit`. | [`angular/`](./angular) |
| Next.js 16 | App Router client island with `'use client'` and `useEffect` init. | [`next/`](./next) |
| Nuxt 4 | SSR-safe dynamic `import()` inside `onMounted`, env via `useRuntimeConfig()`. | [`nuxt/`](./nuxt) |
| SolidJS | `onMount`-driven init inside a Solid root component. | [`solid/`](./solid) |
| Svelte 5 | `onMount` lifecycle with `:global` CSS scoping for the SDK's own DOM. | [`svelte/`](./svelte) |
| Vue 3 | `<script setup>` SFC using `onMounted`, with Vue DevTools wired in. | [`vue/`](./vue) |

## What the JS SDK gives you

- A single `LoginRadiusSDK` class wrapping the core controller plus pre-built UI &mdash; one import covers login, register, profile editor, and workflow flows.
- `sdk.init('auth' | 'login' | 'register' | 'profileEditor' | 'workflow', options)` to mount any flow into a DOM container.
- `sdk.$hooks.call('mapValidationMessages' | 'mapErrorMessages', overrides)` for customizing copy without rebuilding the SDK.
- `sdk.controller.*` if you want raw access to the same auth methods as [`@loginradius/loginradius-core`](../loginradius-core).

Use this SDK when you want a **fast** integration and don't need React-specific hooks/components.

---

## 🚀 Quick start

### Prerequisites

- Node.js **≥ 20.19**
- pnpm **≥ 10** (the repo uses a pnpm workspace; npm/yarn also work per individual demo)

Install once from the repo root, then run any demo:

```bash
# from the repo root
pnpm install

# run a single demo
pnpm --filter @loginradius/demo-js-vue dev
pnpm --filter @loginradius/demo-js-next dev
pnpm --filter @loginradius/demo-js-nuxt dev
```

Or treat any demo as a standalone project:

```bash
cd loginradius-js/vue            # or next, nuxt, svelte, solid, angular, playground
pnpm install
cp .env.example .env.local       # see the per-demo README for the right var prefix
pnpm dev
```

The vanilla demo needs no install &mdash; open `vanilla/index.html` in a browser after replacing the placeholder `apiKey` / `sott`.

### Configuration cheatsheet

| Demo | Env-var prefix | Env file |
|---|---|---|
| `playground`, `solid`, `svelte`, `vue` | `VITE_LOGINRADIUS_*` | `.env.local` |
| `next` | `NEXT_PUBLIC_LOGINRADIUS_*` | `.env.local` |
| `nuxt` | `NUXT_PUBLIC_LOGINRADIUS_*` | `.env` |
| `angular` | n/a &mdash; edit `src/environments/environment.ts` | &mdash; |
| `vanilla` | n/a &mdash; edit `index.html` and `profile.html` inline | &mdash; |

Each per-demo README documents the exact ports, scripts, and framework-specific footguns.

---

## 🏁 Learning LoginRadius

- Full docs at [loginradius.com/docs](https://www.loginradius.com/docs).
- Need lower-level controller access without the bundled UI? See [`../loginradius-core/`](../loginradius-core/).
- Building in React? Prefer [`../loginradius-react/`](../loginradius-react/) for first-class hooks and components.

## License

MIT.
