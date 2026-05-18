# Svelte Demo

A Svelte 5 + Vite demo that mounts the `@loginradius/loginradius-js` pre-built auth UI from `onMount`.

**Stack:** Svelte 5, Vite 7, TypeScript 5, `@sveltejs/vite-plugin-svelte`.

## Prerequisites

- Node.js ≥ 20.19
- pnpm ≥ 10 (or npm/yarn)

## Install

```bash
cd loginradius-js/svelte
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
pnpm check     # svelte-check + tsc type-check
```

## What it demonstrates

- Importing `LoginRadiusSDK` from `@loginradius/loginradius-js` inside a Svelte component's `<script lang="ts">` block.
- Using Svelte's `onMount` lifecycle so init runs only after the component is mounted to the DOM.
- Reading `apiKey` and `sott` from `import.meta.env` (Vite's typed env mechanism).
- Mounting the `login` UI into `#auth-container` via `loginRadius.init('login', { container, onSuccess, onError })`.
- `:global(#auth-container)` style scoping so the SDK's own DOM can be targeted from the component's `<style>` block.

Open `src/App.svelte` for the entry point.

## Troubleshooting

- **`apiKey is undefined`** — `.env.local` is missing or the var name is wrong (must be prefixed `VITE_`). Restart the dev server after editing env files.
- **`onMount` not firing** — make sure the component is reachable from `src/main.ts`; Svelte 5 components don't auto-mount.
- **CORS / 401** — verify your app's Allowed Domains list includes `http://localhost:5173`.
- **Port already in use** — pass `--port 5174` to `pnpm dev`.
