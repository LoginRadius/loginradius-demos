<p align="center">
  <a href="https://www.loginradius.com" target="_blank" rel="noopener noreferrer">
    <img src="https://auth-dev.lrinternal.com/loginradius_favicon.svg" height="64" alt="LoginRadius logo" />
  </a>
</p>

<h1 align="center">LoginRadius Demos</h1>

<p align="center">
  <a href="https://www.loginradius.com/docs"><img src="https://img.shields.io/badge/documentation-loginradius-blue.svg" alt="documentation" /></a>
  <a href="https://pnpm.io"><img src="https://img.shields.io/badge/pnpm-workspace-f69220.svg" alt="pnpm workspace" /></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-%E2%89%A520.19-339933.svg" alt="Node.js >= 20.19" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
</p>

<p align="center">
  Reference integrations of the LoginRadius SDKs across popular web frameworks &mdash; from a single CDN <code>&lt;script&gt;</code> tag to Next.js App Router islands, Nuxt SSR-safe dynamic imports, Angular standalone components, and Vite + React SPAs.
</p>

---

## 📦 What's inside

This monorepo groups demos by SDK family. Each demo is self-contained, installs from npm, and ships with a `.env.example` (or inline placeholder) for tenant credentials.

### JS SDK &mdash; [`loginradius-js/`](./loginradius-js)

Single-bundle SDK that ships the pre-built auth UI on top of the controller. Drop into any frontend and call `sdk.init('auth', { container })`. Package: [`@loginradius/loginradius-js`](https://www.npmjs.com/package/@loginradius/loginradius-js).

| Demo         | Stack                                     | Link                                                        |
| ------------ | ----------------------------------------- | ----------------------------------------------------------- |
| Vanilla HTML | unpkg CDN `<script>`, no bundler          | [`loginradius-js/vanilla/`](./loginradius-js/vanilla)       |
| TypeScript   | Vite + TypeScript, Preact-compat alias    | [`loginradius-js/typescript/`](./loginradius-js/typescript) |
| Angular      | Angular 21 standalone component           | [`loginradius-js/angular/`](./loginradius-js/angular)       |
| Next.js      | Next.js 16 App Router client island       | [`loginradius-js/next/`](./loginradius-js/next)             |
| Nuxt         | Nuxt 4 + Nuxt UI, SSR-safe dynamic import | [`loginradius-js/nuxt/`](./loginradius-js/nuxt)             |
| SolidJS      | SolidJS + Vite, `onMount` init            | [`loginradius-js/solid/`](./loginradius-js/solid)           |
| Svelte       | Svelte 5 + Vite                           | [`loginradius-js/svelte/`](./loginradius-js/svelte)         |
| Vue          | Vue 3 + Vite + DevTools                   | [`loginradius-js/vue/`](./loginradius-js/vue)               |

### React SDK &mdash; [`loginradius-react/`](./loginradius-react)

React-first SDK with `<LoginRadiusProvider>`, `useLoginRadiusSDK()`, `useLRAuth()`, and `<AuthFlow>`/`<LoginFlow>`/`<RegisterFlow>`/`<ProfileFlow>` components. Package: [`@loginradius/loginradius-react`](https://www.npmjs.com/package/@loginradius/loginradius-react).

| Demo       | Stack                             | Link                                                              |
| ---------- | --------------------------------- | ----------------------------------------------------------------- |
| React      | Vite + React 19 + React Router    | [`loginradius-react/react/`](./loginradius-react/react)           |
| Next.js    | Next.js 16 App Router, Tailwind 4 | [`loginradius-react/next/`](./loginradius-react/next)             |

---

## 🚀 Quick start

### Prerequisites

- **Node.js** ≥ 20.19
- **pnpm** ≥ 10 (the repo is a pnpm workspace; npm or yarn also work per individual demo)
- A **LoginRadius app** &mdash; sign up at [loginradius.com](https://www.loginradius.com/), then grab the `apiKey` and `sott` from the Admin Console.

### Clone + install + run

```bash
git clone https://github.com/LoginRadius/loginradius-demos.git
cd loginradius-demos

# install dependencies for every demo via pnpm workspaces
pnpm install

# run any single demo (filter by package name from its package.json)
pnpm --filter @loginradius/demo-react dev
pnpm --filter @loginradius/demo-js-next dev
pnpm --filter @loginradius/demo-js-typescript dev
```

Each demo is also a standalone project &mdash; `cd` into it and use `pnpm install && pnpm dev` directly.

> ⚠️ Add your local dev origin (e.g. `http://localhost:5173`, `:3000`, `:5000`, `:5001`, `:4200`) to your LoginRadius app's **Allowed Domains** before running &mdash; otherwise every controller call returns CORS/401.

---

## 🧱 Repository layout

```
loginradius-demos/
├── loginradius-js/          # @loginradius/loginradius-js (controller + pre-built UI)
│   ├── vanilla/             # unpkg CDN
│   ├── typescript/          # Vite + TS (Preact-compat alias)
│   ├── angular/             # Angular 21
│   ├── next/                # Next.js 16 (App Router)
│   ├── nuxt/                # Nuxt 4 + Nuxt UI 4
│   ├── solid/               # SolidJS + Vite
│   ├── svelte/              # Svelte 5 + Vite
│   └── vue/                 # Vue 3 + Vite
├── loginradius-react/       # @loginradius/loginradius-react (hooks + components)
│   ├── react/               # Vite + React 19 + React Router
│   └── next/                # Next.js 16 + React 19 + Tailwind 4
├── pnpm-workspace.yaml      # workspace globs
└── package.json             # root scripts (format / format:check)
```

Each top-level SDK directory has its own umbrella README with deeper detail.

---
