# SolidJS Demo

A SolidJS + Vite demo that mounts the `@loginradius/loginradius-js` pre-built auth UI from `onMount`.

**Stack:** SolidJS 1.9, Vite 7, TypeScript 5, `vite-plugin-solid`.

## Prerequisites

- Node.js ≥ 20.19
- pnpm ≥ 10 (or npm/yarn)

## Install

```bash
cd loginradius-js/solid
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
pnpm build     # tsc -b && vite build (output in dist/)
pnpm preview   # preview the production build
```

## What it demonstrates

- Importing `LoginRadiusSDK` from `@loginradius/loginradius-js` inside a Solid component.
- Using Solid's `onMount` lifecycle to ensure the SDK only initializes once after the component is attached to the DOM — Solid components run their function body during render, so DOM-touching code must live in `onMount`.
- Reading `apiKey` and `sott` from `import.meta.env` (Vite's typed env mechanism).
- Mounting the `login` UI into `#auth-container` via `loginRadius.init('login', { container, onSuccess, onError })`.

Open `src/App.tsx` for the entry point.

## Troubleshooting

- **`apiKey is undefined`** — `.env.local` is missing or the var name is wrong (must be prefixed `VITE_`). Restart the dev server after editing env files.
- **"Cannot read properties of null"** when init runs — moving the SDK init outside `onMount` will fire before the DOM exists; keep it inside.
- **CORS / 401** — verify your app's Allowed Domains list includes `http://localhost:5173`.
- **Port already in use** — pass `--port 5174` to `pnpm dev`.
