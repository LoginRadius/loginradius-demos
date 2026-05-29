<p align="center">
  <a href="https://www.loginradius.com" target="_blank" rel="noopener noreferrer">
    <img src="https://auth-dev.lrinternal.com/loginradius_favicon.svg" height="64" alt="LoginRadius logo" />
  </a>
</p>

<h1 align="center">LoginRadius JS SDK &mdash; Angular Demo</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@loginradius/loginradius-js"><img src="https://img.shields.io/npm/v/@loginradius/loginradius-js.svg" alt="npm version" /></a>
  <a href="https://angular.dev"><img src="https://img.shields.io/badge/Angular-21-dd0031.svg" alt="Angular 21" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.9-3178c6.svg" alt="TypeScript 5.9" /></a>
  <a href="https://www.loginradius.com/docs"><img src="https://img.shields.io/badge/documentation-loginradius-blue.svg" alt="documentation" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
</p>

<p align="center">
  A reference integration that mounts the LoginRadius pre-built auth UI from an Angular&nbsp;21 standalone root component, using <code>ngOnInit</code> for one-shot SDK bootstrapping.
</p>

<p align="center">
  Part of the <a href="../../README.md">LoginRadius Demos</a> monorepo. The underlying package is <a href="https://www.npmjs.com/package/@loginradius/loginradius-js"><code>@loginradius/loginradius-js</code></a>.
</p>

---

## 🚀 Get started with LoginRadius

1. [Sign up for an account](https://accounts.loginradius.com/auth.aspx?return_url=https://dashboard.loginradius.com/login).
2. Create an application in your LoginRadius Dashboard and grab your **API Key** and **SOTT**.
3. Add `http://localhost:4200` to your app's **Allowed Domains** list.

### Prerequisites

- Node.js **≥ 20.19**
- pnpm **≥ 10** (npm or yarn also work)

### Install

```bash
cd loginradius-js/angular
pnpm install
```

### Configure

Angular doesn't read `.env` files in this template — credentials live in the typed `environment` constant. Edit [`src/environments/environment.ts`](./src/environments/environment.ts):

```ts
export const environment: Environment = {
  production: false,
  loginradiusApiKey: 'your-api-key',
  loginradiusSott: 'your-sott',
};
```

The shape comes from [`src/environments/environment.d.ts`](./src/environments/environment.d.ts). Mirror the same values into `environment.prod.ts` before running `ng build` for production — the file map is configured in [`angular.json`](./angular.json).

> ⚠️ `environment.ts` is committed to the repo. Replace the placeholders locally and **never** push real credentials.

### Run

```bash
pnpm dev      # ng serve on http://localhost:4200
pnpm build    # ng build, output in dist/
pnpm watch    # ng build --watch for incremental dev builds
```

---

## 🧩 What this demo shows

- A single standalone `App` component in [`src/app/app.ts`](./src/app/app.ts) that implements `OnInit` — no `NgModule`, no `BrowserModule`.
- `LoginRadiusSDK` instantiated inside `ngOnInit()` so init happens exactly once after the host view is created.
- Credentials read from the strongly-typed `environment` import (compile-time inlined by `@angular/build`), not `process.env`.
- The auth UI mounted into the `#auth-container` host element declared in [`src/app/app.html`](./src/app/app.html) via `loginRadius.init('auth', { container, onSuccess, onError })`.
- Console logging of `onSuccess` / `onError` payloads — drop your `Router.navigate(...)` or token-persistence call here.

---

## 🛠 Troubleshooting

| Symptom | Likely cause & fix |
|---|---|
| `Cannot find module './environments/environment'` | File deleted or renamed. `tsconfig.app.json` and the `fileReplacements` in `angular.json` both reference it — restore it. |
| `apiKey is undefined` at runtime | You edited `environment.prod.ts` but ran `pnpm dev`, which uses `environment.ts`. Edit the matching file. |
| `401` / CORS error from LoginRadius | Add `http://localhost:4200` to your app's **Allowed Domains**. |
| `Port 4200 already in use` | Run on a different port: `pnpm dev -- --port 4201`. |
| SDK styles missing | Import `@loginradius/loginradius-js/dist/LoginRadiusV3.css` from `src/styles.css` if you customize the global stylesheet. |

---

## 🏁 Learning LoginRadius

The full LoginRadius documentation lives at [loginradius.com/docs](https://www.loginradius.com/docs).

- New to LoginRadius? Start with the [quickstart guides](https://www.loginradius.com/docs/).
- Looking for other frameworks? Browse the sibling demos under [`loginradius-js/`](../) (Next.js, Nuxt, Vue, Svelte, Solid, Vanilla, Playground).
- Building with React components instead of the pre-built UI? See [`loginradius-react/`](../../loginradius-react/).

---

## 🛟 Release notes

Curious what shipped recently? Browse the [`@loginradius/loginradius-js` releases](https://www.npmjs.com/package/@loginradius/loginradius-js?activeTab=versions) on npm.

---

## License

MIT.
