# Vue Demo

A Vue 3 + Vite demo that mounts the `@loginradius/loginradius-js` pre-built auth UI from `onMounted`.

**Stack:** Vue 3.5, Vite 7, `@vitejs/plugin-vue`, `vite-plugin-vue-devtools`.

## Prerequisites

- Node.js ^20.19 || >=22.12
- pnpm ≥ 10 (or npm/yarn)

## Install

```bash
cd loginradius-js/vue
pnpm install
```

## Configure

Copy the example env file and fill in your LoginRadius credentials:

```bash
cp .env.example .env.local
```

```bash
VITE_LOGINRADIUS_API_KEY=your-api-key
VITE_LOGINRADIUS_SOTT=your-sott
```

## Run

```bash
pnpm dev       # vite dev server on http://localhost:5173
pnpm build     # vite build (output in dist/)
pnpm preview   # preview the production build
```

## What it demonstrates

- Importing `LoginRadiusSDK` from `@loginradius/loginradius-js` inside a `<script setup>` block.
- Using Vue's `onMounted` lifecycle so init runs only after the component is attached to the DOM.
- Reading `apiKey` and `sott` from `import.meta.env` (Vite's typed env mechanism).
- Mounting the `login` UI into the `#auth-container` element declared in the `<template>` via `loginRadius.init('login', { container, onSuccess, onError })`.
- Vue DevTools auto-wired through `vite-plugin-vue-devtools` for inspecting component state during integration debugging.

Open `src/App.vue` for the entry point.

## Troubleshooting

- **`apiKey is undefined`** — `.env.local` is missing or the var name is wrong (must be prefixed `VITE_`). Restart the dev server after editing env files.
- **Init runs before `#auth-container` exists** — keep the SDK call inside `onMounted`, not at the top of `<script setup>`.
- **CORS / 401** — verify your app's Allowed Domains list includes `http://localhost:5173`.
- **Port already in use** — pass `--port 5174` to `pnpm dev`.
