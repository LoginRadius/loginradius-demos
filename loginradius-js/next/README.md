<p align="center">
  <a href="https://www.loginradius.com" target="_blank" rel="noopener noreferrer">
    <img src="https://auth-dev.lrinternal.com/loginradius_favicon.svg" height="64" alt="LoginRadius logo" />
  </a>
</p>

<h1 align="center">LoginRadius JS SDK &mdash; Next.js Demo</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@loginradius/loginradius-js"><img src="https://img.shields.io/npm/v/@loginradius/loginradius-js.svg" alt="npm version" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-black.svg" alt="Next.js 16" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61dafb.svg" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178c6.svg" alt="TypeScript 5" /></a>
  <a href="https://www.loginradius.com/docs"><img src="https://img.shields.io/badge/documentation-loginradius-blue.svg" alt="documentation" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
</p>

<p align="center">
  A reference integration that mounts the LoginRadius pre-built auth UI inside a Next.js&nbsp;16 App Router project, with the SDK scoped to a client component so it only runs in the browser.
</p>

<p align="center">
  Part of the <a href="../../README.md">LoginRadius Demos</a> monorepo. The underlying package is <a href="https://www.npmjs.com/package/@loginradius/loginradius-js"><code>@loginradius/loginradius-js</code></a>.
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
cd loginradius-js/next
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
```

> ⚠️ The `NEXT_PUBLIC_` prefix is **required**. Without it, Next.js does not expose the values to client components and the SDK will fail to initialize.

### Run

```bash
pnpm dev      # next dev on http://localhost:3000
pnpm build    # next build (production bundle)
pnpm start    # next start (serves the production build)
```

---

## 🧩 What this demo shows

- The `'use client'` directive on [`app/page.tsx`](./app/page.tsx), scoping the SDK to the browser while the rest of the App Router tree remains server-rendered.
- Reading `apiKey` / `sott` from `process.env.NEXT_PUBLIC_*` at module scope.
- Instantiating `new LoginRadiusSDK(...)` inside `useEffect` so init runs exactly once after mount.
- Mounting the login UI into `#auth-container` via `loginRadius.init('auth', { container, onSuccess, onError })`.
- A clean separation between the Next.js layout ([`app/layout.tsx`](./app/layout.tsx)) and the auth client island ([`app/page.tsx`](./app/page.tsx)).

---

## 🛠 Troubleshooting

| Symptom | Likely cause & fix |
|---|---|
| `apiKey is undefined` | Env var missing the `NEXT_PUBLIC_` prefix, or `next dev` not restarted after editing `.env.local`. |
| `window is not defined` / SSR crash | The `'use client'` directive at the top of `app/page.tsx` was removed. Restore it. |
| `401` / CORS error from LoginRadius | The current origin is not in your app's **Allowed Domains**. Add `http://localhost:3000`. |
| `Port 3000 already in use` | Run on a different port: `pnpm dev -- -p 3001`. |

---

## 🏁 Learning LoginRadius

The full LoginRadius documentation lives at [loginradius.com/docs](https://www.loginradius.com/docs).

- New to LoginRadius? Start with the [quickstart guides](https://www.loginradius.com/docs/).
- Looking for other frameworks? Browse the sibling demos under [`loginradius-js/`](../) (Nuxt, Vue, Svelte, Solid, Angular, Vanilla, Playground).
- Building with React components instead of the pre-built UI? See [`loginradius-react/`](../../loginradius-react/).

---

## 🛟 Release notes

Curious what shipped recently? Browse the [`@loginradius/loginradius-js` releases](https://www.npmjs.com/package/@loginradius/loginradius-js?activeTab=versions) on npm.

---

## License

This project is licensed under the [MIT License](../../LICENSE).
