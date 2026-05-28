<p align="center">
  <a href="https://www.loginradius.com" target="_blank" rel="noopener noreferrer">
    <img src="https://auth-dev.lrinternal.com/loginradius_favicon.svg" height="64" alt="LoginRadius logo" />
  </a>
</p>

<h1 align="center">LoginRadius JS SDK &mdash; SolidJS Demo</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@loginradius/loginradius-js"><img src="https://img.shields.io/npm/v/@loginradius/loginradius-js.svg" alt="npm version" /></a>
  <a href="https://www.solidjs.com"><img src="https://img.shields.io/badge/SolidJS-1.9-2c4f7c.svg" alt="SolidJS 1.9" /></a>
  <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/Vite-7-646cff.svg" alt="Vite 7" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.9-3178c6.svg" alt="TypeScript 5.9" /></a>
  <a href="https://www.loginradius.com/docs"><img src="https://img.shields.io/badge/documentation-loginradius-blue.svg" alt="documentation" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
</p>

<p align="center">
  A reference integration that mounts the LoginRadius pre-built auth UI inside a SolidJS root component, deferring SDK init to <code>onMount</code> so the DOM target exists before <code>init</code> runs.
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
cd loginradius-js/solid
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

> ⚠️ The `VITE_` prefix is **required** &mdash; Vite only exposes prefixed vars on `import.meta.env`.

### Run

```bash
pnpm dev      # vite dev server on http://localhost:5173
pnpm build    # tsc -b && vite build (output in dist/)
pnpm preview  # preview the production build
```

---

## 🧩 What this demo shows

- The Solid `App` component in [`src/App.tsx`](./src/App.tsx) registers an `onMount` callback &mdash; Solid runs the function body during render, so any DOM-touching code (like `loginRadius.init`) **must** live in `onMount`, not at the top of the component.
- `LoginRadiusSDK` instantiated with `apiKey` and `sott` from `import.meta.env`, read inside `onMount` so Vite's typed env mechanism is honored.
- The auth UI mounted into the `<div id="auth-container">` rendered by the JSX return, via `loginRadius.init('auth', { container, onSuccess, onError })`.
- `vite-plugin-solid` wired in for Solid's JSX transform (see [`vite.config.ts`](./vite.config.ts) / [`package.json`](./package.json)).
- `tsc -b` invoked before `vite build` so the type errors fail the build, not just the editor.

---

## 🛠 Troubleshooting

| Symptom | Likely cause & fix |
|---|---|
| `apiKey is undefined` | `.env.local` missing or vars not prefixed `VITE_`. Restart the dev server after edits. |
| `Cannot read properties of null` when `init` runs | SDK init moved outside `onMount` &mdash; it fires before the JSX is in the DOM. Keep it inside `onMount`. |
| Reactive state changing after mount doesn't re-init | Intentional &mdash; the SDK is initialized once per component lifetime. Wrap init in `createEffect` only if you genuinely need re-init on signal change. |
| `401` / CORS error from LoginRadius | Add `http://localhost:5173` to your app's **Allowed Domains**. |
| `Port 5173 already in use` | Pass `--port 5174` to `pnpm dev`. |

---

## 🏁 Learning LoginRadius

The full LoginRadius documentation lives at [loginradius.com/docs](https://www.loginradius.com/docs).

- New to LoginRadius? Start with the [quickstart guides](https://www.loginradius.com/docs/).
- Looking for other frameworks? Browse the sibling demos under [`loginradius-js/`](../) (Next.js, Nuxt, Vue, Svelte, Angular, Vanilla, Playground).
- Building with React components instead of the pre-built UI? See [`loginradius-react/`](../../loginradius-react/).

---

## 🛟 Release notes

Curious what shipped recently? Browse the [`@loginradius/loginradius-js` releases](https://www.npmjs.com/package/@loginradius/loginradius-js?activeTab=versions) on npm.

---

## License

MIT.
