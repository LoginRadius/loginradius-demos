<p align="center">
  <a href="https://www.loginradius.com" target="_blank" rel="noopener noreferrer">
    <img src="https://auth-dev.lrinternal.com/loginradius_favicon.svg" height="64" alt="LoginRadius logo" />
  </a>
</p>

<h1 align="center">LoginRadius React SDK &mdash; Next.js Demo</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@loginradius/loginradius-react"><img src="https://img.shields.io/npm/v/@loginradius/loginradius-react.svg" alt="npm version" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16.1-black.svg" alt="Next.js 16.1" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19.2-61dafb.svg" alt="React 19.2" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-4-38bdf8.svg" alt="Tailwind 4" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178c6.svg" alt="TypeScript 5" /></a>
  <a href="https://www.loginradius.com/docs"><img src="https://img.shields.io/badge/documentation-loginradius-blue.svg" alt="documentation" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
</p>

<p align="center">
  A reference integration that renders the LoginRadius React <code>&lt;Auth&gt;</code> flow inside a Next.js&nbsp;16 App Router client page, with <code>&lt;LoginRadiusProvider&gt;</code> scoped to the page so the rest of the layout stays server-rendered.
</p>

<p align="center">
  Part of the <a href="../../README.md">LoginRadius Demos</a> monorepo. The underlying package is <a href="https://www.npmjs.com/package/@loginradius/loginradius-react"><code>@loginradius/loginradius-react</code></a>.
</p>

---

## 🚀 Get started with LoginRadius

1. [Sign up for an account](https://accounts.loginradius.com/auth.aspx?return_url=https://dashboard.loginradius.com/login).
2. Create an application in your LoginRadius Dashboard and grab your **API Key** and **SOTT**.
3. Add `http://localhost:3000` to your app's **Allowed Domains** list.

### Prerequisites

- Node.js **≥ 20.19**
- pnpm **≥ 10** (npm or yarn also work)

### Install

```bash
cd loginradius-react/next
pnpm install
```

### Configure

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_LOGINRADIUS_API_KEY=your-api-key
NEXT_PUBLIC_LOGINRADIUS_SOTT=your-sott
NEXT_PUBLIC_LOGINRADIUS_VERIFICATION_URL=https://your-tenant.example.com/auth.aspx
NEXT_PUBLIC_LOGINRADIUS_RESET_PASSWORD_URL=https://your-tenant.example.com/auth.aspx
NEXT_PUBLIC_LOGINRADIUS_CALLBACK_URL=http://localhost:3000
NEXT_PUBLIC_LOGINRADIUS_LOCALIZATION=true
```

> ⚠️ Only `NEXT_PUBLIC_*` variables are exposed to the browser. Anything without the prefix stays server-only &mdash; never put server-side secrets under `NEXT_PUBLIC_`. Rebuild after editing `.env.local`; Next.js inlines these values at build time.

### Run

```bash
pnpm dev      # next dev on http://localhost:3000
pnpm build    # next build (production bundle)
pnpm start    # next start (serves the production build)
pnpm lint     # ESLint via next/core-web-vitals
```

---

## 🧩 What this demo shows

- The `'use client'` directive on [`app/page.tsx`](./app/page.tsx) &mdash; required because `<LoginRadiusProvider>` uses React context and the SDK touches `window`, `localStorage`, and WebAuthn at init.
- The provider mounted **inside** the page (not `app/layout.tsx`), keeping the layout server-rendered. Lift it into a dedicated client wrapper if you need auth state across routes.
- A typed options object built from `process.env.NEXT_PUBLIC_*`, including the `disableLocalization` derivation and extra hard-coded `OtpType: 'email'` / `OtpLength: 6` settings.
- The combined `<Auth>` flow component (not separate `<Login>` / `<Register>`) with typed `onSuccess: (response: ApiResponse<AuthResponse>) => void` and `onError: (error: ApiError) => void` callbacks.
- An `onLoading` prop passed to `<LoginRadiusProvider>` that toggles a `#my-loader` DOM element &mdash; an example of imperative DOM access from a client component, useful when you can't move the loader into React state.

---

## 🛠 Troubleshooting

| Symptom | Likely cause & fix |
|---|---|
| `You're importing a component that needs useState...` | `'use client'` is missing at the top of any file importing the SDK, its hooks, or its components. Add it as the first non-comment line. |
| Env vars are `undefined` at runtime | Missing `NEXT_PUBLIC_` prefix, or `next dev` not restarted after editing `.env.local`. Build-time inlining requires a rebuild for `next build`. |
| Hydration mismatch warning around the auth card | SDK state is rendering during SSR. Gate post-auth UI behind a `useEffect`-set flag, or dynamically import the auth section with `{ ssr: false }`. |
| `401` / CORS error from LoginRadius | Add `http://localhost:3000` to your app's **Allowed Domains**. |
| `Port 3000 already in use` | Run on a different port: `pnpm dev -- -p 3001`. |

---

## 🏁 Learning LoginRadius

The full LoginRadius documentation lives at [loginradius.com/docs](https://www.loginradius.com/docs).

- New to LoginRadius? Start with the [quickstart guides](https://www.loginradius.com/docs/).
- Want a Vite + React SPA instead? See [`loginradius-react/react/`](../react/).
- Need the pre-built UI without React hooks? See [`loginradius-js/next/`](../../loginradius-js/next/) for the equivalent JS SDK demo on Next.js.

---

## 🛟 Release notes

Curious what shipped recently? Browse the [`@loginradius/loginradius-react` releases](https://www.npmjs.com/package/@loginradius/loginradius-react?activeTab=versions) on npm.

---

## License

MIT.
