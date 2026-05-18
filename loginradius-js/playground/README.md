# Playground Demo

A typed Vite sandbox for exercising `@loginradius/loginradius-js` — the single-bundle JS SDK with pre-built UI. Use this as the fastest iteration loop when prototyping options, callbacks, and init modes.

**Stack:** Vite 7, TypeScript 5, Preact aliased to React (via `vite.config.ts`).

## Prerequisites

- Node.js ≥ 20.19
- pnpm ≥ 10 (or npm/yarn)

## Install

```bash
cd loginradius-js/playground
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
pnpm build     # production build into dist/
pnpm preview   # preview the production build
```

## What it demonstrates

- Importing `LoginRadiusSDK` from `@loginradius/loginradius-js` and instantiating it with `apiKey` + `sott` read from `import.meta.env`.
- Mounting the pre-built login UI into `#auth-container` via `loginRadius.init('login', { container, onSuccess, onError })`.
- Forwarding success/error payloads to the console — drop a breakpoint here to inspect the access token shape.
- A Vite alias that maps `react` → `preact/compat` so the SDK's internal React tree runs on Preact, keeping the bundle small.

Open `src/main.ts` for the entry point.

## Troubleshooting

- **`apiKey is undefined`** — `.env.local` is missing or the var name is wrong (must be prefixed `VITE_`). Restart the dev server after editing env files.
- **CORS / 401** — verify your app's Allowed Domains list includes `http://localhost:5173`.
- **Port already in use** — pass `--port 5174` to `pnpm dev` or stop the conflicting process.
- **Blank page, no error** — check the browser console for a missing SOTT, which causes the SDK to silently abort init.
