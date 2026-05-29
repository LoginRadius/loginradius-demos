<p align="center">
  <a href="https://www.loginradius.com" target="_blank" rel="noopener noreferrer">
    <img src="https://auth-dev.lrinternal.com/loginradius_favicon.svg" height="64" alt="LoginRadius logo" />
  </a>
</p>

<h1 align="center">LoginRadius JS SDK &mdash; Svelte Demo</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@loginradius/loginradius-js"><img src="https://img.shields.io/npm/v/@loginradius/loginradius-js.svg" alt="npm version" /></a>
  <a href="https://svelte.dev"><img src="https://img.shields.io/badge/Svelte-5-ff3e00.svg" alt="Svelte 5" /></a>
  <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/Vite-7-646cff.svg" alt="Vite 7" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.9-3178c6.svg" alt="TypeScript 5.9" /></a>
  <a href="https://www.loginradius.com/docs"><img src="https://img.shields.io/badge/documentation-loginradius-blue.svg" alt="documentation" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
</p>

<p align="center">
  A reference integration that mounts the LoginRadius pre-built auth UI from a Svelte&nbsp;5 component, using <code>onMount</code> so the SDK only touches the DOM after the component is attached.
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
cd loginradius-js/svelte
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
pnpm build    # vite build (output in dist/)
pnpm preview  # preview the production build
pnpm check    # svelte-check + tsc type-check
```

---

## 🧩 What this demo shows

- A Svelte 5 component in [`src/App.svelte`](./src/App.svelte) using `<script lang="ts">` and the `onMount` lifecycle hook from `svelte` &mdash; preferred over `$effect` here because init is a one-shot side effect, not a reactive computation.
- `LoginRadiusSDK` imported at the top of the script block but instantiated **inside** `onMount`, so the `#auth-container` element from the `<main>` template exists before `init` runs.
- `apiKey` / `sott` pulled from `import.meta.env.VITE_*` &mdash; Vite-native, type-safe via [`vite-env.d.ts`](./src/vite-env.d.ts).
- `:global(#auth-container)` in the component's scoped `<style>` block so global CSS can target the SDK's own DOM tree without breaking Svelte's CSS scoping.
- `svelte-check` wired into the `check` script for SFC type validation that the editor alone won't catch.

---

## 🛠 Troubleshooting

| Symptom | Likely cause & fix |
|---|---|
| `apiKey is undefined` | `.env.local` missing or vars not prefixed `VITE_`. Restart the dev server after edits. |
| `onMount` never fires | The component isn't mounted from [`src/main.ts`](./src/main.ts) &mdash; Svelte 5 requires explicit `mount(App, { target: ... })`. |
| Switching SDK to `$effect` re-fires on every state change | Use `onMount` for one-shot init; `$effect` re-runs whenever its dependencies change. |
| `401` / CORS error from LoginRadius | Add `http://localhost:5173` to your app's **Allowed Domains**. |
| `Port 5173 already in use` | Pass `--port 5174` to `pnpm dev`. |

---

## 🏁 Learning LoginRadius

The full LoginRadius documentation lives at [loginradius.com/docs](https://www.loginradius.com/docs).

- New to LoginRadius? Start with the [quickstart guides](https://www.loginradius.com/docs/).
- Looking for other frameworks? Browse the sibling demos under [`loginradius-js/`](../) (Next.js, Nuxt, Vue, Solid, Angular, Vanilla, Playground).
- Building with React components instead of the pre-built UI? See [`loginradius-react/`](../../loginradius-react/).

---

## 🛟 Release notes

Curious what shipped recently? Browse the [`@loginradius/loginradius-js` releases](https://www.npmjs.com/package/@loginradius/loginradius-js?activeTab=versions) on npm.

---

## License

MIT.
