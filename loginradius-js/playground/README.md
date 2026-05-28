<p align="center">
  <a href="https://www.loginradius.com" target="_blank" rel="noopener noreferrer">
    <img src="https://auth-dev.lrinternal.com/loginradius_favicon.svg" height="64" alt="LoginRadius logo" />
  </a>
</p>

<h1 align="center">LoginRadius JS SDK &mdash; Playground</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@loginradius/loginradius-js"><img src="https://img.shields.io/npm/v/@loginradius/loginradius-js.svg" alt="npm version" /></a>
  <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/Vite-7-646cff.svg" alt="Vite 7" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.9-3178c6.svg" alt="TypeScript 5.9" /></a>
  <a href="https://www.loginradius.com/docs"><img src="https://img.shields.io/badge/documentation-loginradius-blue.svg" alt="documentation" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
</p>

<p align="center">
  A typed Vite + TypeScript sandbox for exercising the LoginRadius pre-built auth UI without a UI framework on top &mdash; the fastest iteration loop when prototyping <code>LoginRadiusSDK</code> options, hooks, and init modes.
</p>

<p align="center">
  Part of the <a href="../../README.md">LoginRadius Demos</a> monorepo. The underlying package is <a href="https://www.npmjs.com/package/@loginradius/loginradius-js"><code>@loginradius/loginradius-js</code></a>.
</p>

---

## 🚀 Get started with LoginRadius

1. [Sign up for an account](https://accounts.loginradius.com/auth.aspx?return_url=https://dashboard.loginradius.com/login).
2. Create an application in your LoginRadius Dashboard and grab your **API Key** and **SOTT**.
3. Add `http://localhost:5173` to your app's **Allowed Domains** list.

### Prerequisites

- Node.js **≥ 20.19**
- pnpm **≥ 10** (npm or yarn also work)

### Install

```bash
cd loginradius-js/playground
pnpm install
```

### Configure

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env.local
```

```env
VITE_LOGINRADIUS_API_KEY=your-api-key
VITE_LOGINRADIUS_SOTT=your-sott
```

> ⚠️ The `VITE_` prefix is **required**. Without it, Vite doesn't expose values on `import.meta.env` and the SDK fails to initialize.

### Run

```bash
pnpm dev      # vite dev server on http://localhost:5173
pnpm build    # production bundle into dist/
pnpm preview  # serve the dist/ build locally
```

---

## 🧩 What this demo shows

- A top-level [`src/main.ts`](./src/main.ts) module-scope `import` of `LoginRadiusSDK` &mdash; no framework lifecycle, no client-island indirection.
- `apiKey` and `sott` read from `import.meta.env.VITE_*` at module scope; Vite inlines them at build time.
- `loginRadius.init('auth', { container: 'auth-container', onSuccess, onError })` mounting the combined login + register flow into the `#auth-container` div in [`index.html`](./index.html).
- A Vite alias in [`vite.config.ts`](./vite.config.ts) mapping `react` → `preact/compat` (and `react/jsx-runtime` → `preact/jsx-runtime`) so the SDK's internal React tree runs on Preact, shrinking the bundle.
- Source maps enabled for production builds &mdash; useful when debugging the SDK from the browser devtools.

---

## 🛠 Troubleshooting

| Symptom | Likely cause & fix |
|---|---|
| `apiKey is undefined` | `.env.local` missing or vars not prefixed `VITE_`. Restart `vite dev` after editing env files. |
| Blank page, no error in console | A missing/invalid `sott` causes the SDK to silently abort init. Re-check the value from the Admin Console. |
| `401` / CORS error from LoginRadius | Add `http://localhost:5173` to your app's **Allowed Domains**. |
| Preact aliasing breaks types | The alias only affects bundling; if `@types/react` is required elsewhere, install it as a dev dependency &mdash; do not remove the alias. |
| `Port 5173 already in use` | Pass `--port 5174` to `pnpm dev`, or stop the conflicting process. |

---

## 🏁 Learning LoginRadius

The full LoginRadius documentation lives at [loginradius.com/docs](https://www.loginradius.com/docs).

- New to LoginRadius? Start with the [quickstart guides](https://www.loginradius.com/docs/).
- Looking for other frameworks? Browse the sibling demos under [`loginradius-js/`](../) (Next.js, Nuxt, Vue, Svelte, Solid, Angular, Vanilla).
- Building with React components instead of the pre-built UI? See [`loginradius-react/`](../../loginradius-react/).
- Need the lower-level controller without the bundled UI? See [`loginradius-core/`](../../loginradius-core/).

---

## 🛟 Release notes

Curious what shipped recently? Browse the [`@loginradius/loginradius-js` releases](https://www.npmjs.com/package/@loginradius/loginradius-js?activeTab=versions) on npm.

---

## License

MIT.
