# Next.js Demo

A Next.js 16 App Router demo that mounts the `@loginradius/loginradius-js` pre-built auth UI from a client component, so the SDK only runs in the browser.

**Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript 5, Tailwind v4.

## Prerequisites

- Node.js ≥ 20.19
- pnpm ≥ 10 (or npm/yarn)

## Install

```bash
cd loginradius-js/next
pnpm install
```

## Configure

Copy the example env file and fill in your LoginRadius credentials:

```bash
cp .env.example .env.local
```

```bash
NEXT_PUBLIC_LOGINRADIUS_API_KEY=your-api-key
NEXT_PUBLIC_LOGINRADIUS_SOTT=your-sott
```

The `NEXT_PUBLIC_` prefix is required — without it, Next.js will not expose the values to client components.

## Run

```bash
pnpm dev       # next dev on http://localhost:3000
pnpm build     # next build
pnpm start     # next start (serves the production build)
```

## What it demonstrates

- The `'use client'` directive on `app/page.tsx`, scoping the SDK to the browser and keeping the rest of the App Router tree on the server.
- Reading `apiKey` / `sott` from `process.env.NEXT_PUBLIC_*` at module scope.
- Instantiating `new LoginRadiusSDK(...)` inside a `useEffect` so init runs once after mount.
- Mounting the `login` UI into `#auth-container` via `loginRadius.init('login', { container, onSuccess, onError })`.
- A clean separation between Next.js layout (`app/layout.tsx`) and the auth client island (`app/page.tsx`).

## Troubleshooting

- **`apiKey is undefined`** — env vars must start with `NEXT_PUBLIC_` to reach client components. Restart `next dev` after editing `.env.local`.
- **`window is not defined` / SSR error** — the `'use client'` directive at the top of `page.tsx` is required; do not remove it.
- **CORS / 401** — verify your app's Allowed Domains list includes `http://localhost:3000`.
- **Port 3000 already in use** — run `pnpm dev -- -p 3001`.
