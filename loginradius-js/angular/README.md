# Angular Demo

An Angular 21 standalone-component demo that mounts the `@loginradius/loginradius-js` pre-built auth UI from a single root component's `ngOnInit`.

**Stack:** Angular 21, TypeScript 5.9, `@angular/build` (esbuild-based) toolchain.

## Prerequisites

- Node.js ≥ 20.19
- pnpm ≥ 10 (or npm/yarn)

## Install

```bash
cd loginradius-js/angular
pnpm install
```

## Configure

Angular does not consume `.env` files in this template — credentials live in `src/environments/environment.ts` (dev) and `src/environments/environment.prod.ts` (prod). Edit the dev file:

```ts
// src/environments/environment.ts
export const environment: Environment = {
  production: false,
  loginradiusApiKey: 'your-api-key',
  loginradiusSott: 'your-sott',
};
```

The `Environment` type is declared in `src/environments/environment.d.ts`. Apply the same values to `environment.prod.ts` before running `ng build` for production.

## Run

```bash
pnpm dev       # ng serve on http://localhost:4200
pnpm build     # ng build, output in dist/
pnpm watch     # ng build --watch for incremental dev builds
```

## What it demonstrates

- Importing `LoginRadiusSDK` from `@loginradius/loginradius-js` inside the root standalone `App` component.
- Initializing the SDK in `ngOnInit()` using values from the typed `environment` constant.
- Mounting the `auth` UI (combined login + register) into the `#auth-container` element rendered by `app.html`.
- Logging the success/error payloads to the console — the place to wire your own router navigation or token storage.

Open `src/app/app.ts` for the entry point.

## Troubleshooting

- **`Cannot find module './environments/environment'`** — make sure you didn't delete the file; the `tsconfig.app.json` paths depend on it.
- **CORS / 401** — verify your app's Allowed Domains list includes `http://localhost:4200`.
- **Port 4200 already in use** — run `pnpm dev -- --port 4201`.
- **SDK styles missing** — Angular's `styles.css` should import the SDK stylesheet from `node_modules/@loginradius/loginradius-js/dist/LoginRadiusV3.css` if you customize global styles.
