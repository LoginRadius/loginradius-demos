# `@loginradius/loginradius-js` demos

Reference apps that consume **[`@loginradius/loginradius-js`](https://www.npmjs.com/package/@loginradius/loginradius-js)** — a single-bundle JS SDK that ships pre-built UI on top of the auth controller. Drop it into any frontend (vanilla, React, Vue, Angular, etc.) and call `sdk.init('auth', { container: '#my-div' })`.

| Demo | Stack | Default dev port |
|---|---|---|
| [`vanilla/`](./vanilla) | Plain HTML + `<script>` from unpkg | open in browser |
| [`playground/`](./playground) | Vite + TypeScript (Preact aliased to React) | `5173` |
| [`angular/`](./angular) | Angular 21 | `4200` |
| [`next/`](./next) | Next.js 16 (App Router) | `3000` |
| [`nuxt/`](./nuxt) | Nuxt 4 + Nuxt UI | `3000` |
| [`solid/`](./solid) | SolidJS + Vite | `5173` |
| [`svelte/`](./svelte) | Svelte 5 + Vite | `5173` |
| [`vue/`](./vue) | Vue 3 + Vite | `5173` |

## What the JS SDK gives you

- A single `LoginRadiusSDK` class that wraps the core controller and ships pre-built UI.
- `sdk.init('auth' | 'login' | 'register' | 'profileEditor' | 'workflow', options)` to mount any flow into a DOM container.
- `sdk.$hooks.call('mapValidationMessages' | 'mapErrorMessages', overrides)` for customizing copy.
- `sdk.controller.*` if you want raw access to the same auth methods as `@loginradius/loginradius-core`.

Use this SDK when you want a **fast** integration and don't need React-specific hooks/components.

## Quick start

Pick a demo and run it on its own:

```bash
cd loginradius-js/vue            # or next, nuxt, svelte, solid, angular, playground
pnpm install
cp .env.example .env.local       # see Configuration below
pnpm dev
```

The vanilla demo needs no install — open `vanilla/index.html` in a browser after editing the placeholder `apiKey` / `sott` inline.

## Configuration

All demos require an `apiKey` and `sott` from your LoginRadius app. The variable name depends on the bundler:

| Demo | Var prefix | File |
|---|---|---|
| `playground`, `solid`, `svelte`, `vue` | `VITE_LOGINRADIUS_*` | `.env.local` |
| `next` | `NEXT_PUBLIC_LOGINRADIUS_*` | `.env.local` |
| `nuxt` | `NUXT_PUBLIC_LOGINRADIUS_*` | `.env` |
| `angular` | n/a — edit `src/environments/environment.ts` | — |
| `vanilla` | n/a — edit `index.html` and `profile.html` | — |

Typical Vite-style `.env.local`:

```bash
VITE_LOGINRADIUS_API_KEY=your-api-key
VITE_LOGINRADIUS_SOTT=your-sott
```

## Common snippet

```ts
import { LoginRadiusSDK } from '@loginradius/loginradius-js';

const sdk = new LoginRadiusSDK({
  apiKey: import.meta.env.VITE_LOGINRADIUS_API_KEY,
  sott: import.meta.env.VITE_LOGINRADIUS_SOTT,
  callbackUrl: window.location.origin,
});

sdk.init('auth', {
  container: 'lr-auth',
  onSuccess: (res) => console.log('auth success', res),
  onError: (err) => console.error('auth error', err),
});
```
