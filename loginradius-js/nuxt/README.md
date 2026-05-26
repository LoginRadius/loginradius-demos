# Nuxt Demo

A Nuxt 4 demo that mounts the `@loginradius/loginradius-js` pre-built auth UI from `onMounted`, using `useRuntimeConfig()` to read public credentials at runtime.

**Stack:** Nuxt 4, Nuxt UI 4, Tailwind CSS v4, Vue 3.

## Prerequisites

- Node.js ≥ 20.19
- pnpm ≥ 10 (or npm/yarn)

## Install

```bash
cd loginradius-js/nuxt
pnpm install
```

## Configure

Copy the example env file and fill in your LoginRadius credentials:

```bash
cp .env.example .env
```

```bash
NUXT_PUBLIC_LOGINRADIUS_API_KEY=your-api-key
NUXT_PUBLIC_LOGINRADIUS_SOTT=your-sott
```

Nuxt maps `NUXT_PUBLIC_*` env vars onto `runtimeConfig.public` via `nuxt.config.ts`, where they become `config.public.loginradiusApiKey` and `config.public.loginradiusSott`.

## Run

```bash
pnpm dev       # nuxt dev on http://localhost:3000
pnpm build     # nuxt build (Nitro server output)
pnpm preview   # nuxt preview
```

## What it demonstrates

- A `<script setup>` component that dynamically `import()`s `@loginradius/loginradius-js` inside `onMounted`, ensuring the SDK only runs on the client and never executes during SSR.
- Reading credentials via `useRuntimeConfig().public.*` instead of `process.env` directly — the Nuxt-idiomatic pattern.
- Mounting the `login` UI into the `#auth-container` element declared in the `<template>`.
- `useHead` / `useSeoMeta` composables for page metadata, demonstrating how the auth island composes with the rest of a Nuxt page.

Open `app/app.vue` for the entry point and `nuxt.config.ts` for the `runtimeConfig` wiring.

## Troubleshooting

- **`config.public.loginradiusApiKey` is undefined** — env vars must start with `NUXT_PUBLIC_` and match the keys in `nuxt.config.ts`. Restart `nuxt dev` after editing `.env`.
- **SSR error referencing `window` / `document`** — keep the SDK import inside `onMounted` (dynamic `import()`). Do not move it to the top of `<script setup>`.
- **CORS / 401** — verify your app's Allowed Domains list includes `http://localhost:3000`.
- **Port 3000 already in use** — run `pnpm dev -- --port 3001`.
