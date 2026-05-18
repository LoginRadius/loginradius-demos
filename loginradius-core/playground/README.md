# Core Playground

A typed Vite sandbox for exercising `@loginradius/loginradius-core` — the framework-agnostic core. Use this as a fast iteration loop while you build your own UI on top of the LoginRadius auth controller, flow registry, and schemas.

**Stack:** Vite 7, TypeScript 5, no UI framework.

## Prerequisites

- Node.js ≥ 20.19
- pnpm ≥ 10 (or npm/yarn)

## Install

```bash
cd loginradius-core/playground
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
VITE_LOGINRADIUS_VERIFICATION_URL=https://your-tenant.example.com/auth.aspx
VITE_LOGINRADIUS_RESET_PASSWORD_URL=https://your-tenant.example.com/auth.aspx
VITE_LOGINRADIUS_CALLBACK_URL=http://localhost:5001
```

## Run

```bash
pnpm dev       # vite dev server on http://localhost:5001
pnpm build     # production build into dist/
pnpm preview   # preview the production build on http://localhost:4301
```

## What it demonstrates

- Calling `LoginRadiusCore.createLoginRadius({ ... })` and awaiting the instance.
- Driving the controller directly: `lr.controller.login(...)`, `register(...)`, schemas.
- Reading translations and branding from the `content` payload.

Open `src/main.ts` for the entry point.

## Troubleshooting

- **`apiKey is undefined`** — `.env.local` is missing or the var name is wrong (must be prefixed `VITE_`).
- **CORS / 401** — verify your app's Allowed Domains list includes `http://localhost:5001`.
