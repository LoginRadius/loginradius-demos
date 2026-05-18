# LoginRadius SDK Demos

Reference applications that show how to integrate the LoginRadius v3 JavaScript SDKs into real-world frontends — vanilla HTML, modern bundlers, and the major UI frameworks. Each demo is self-contained and installs the SDK directly from npm; nothing here depends on the internal LoginRadius monorepo.

## Repository layout

```
loginradius-demos/
├── loginradius-core/        # Framework-agnostic core SDK (@loginradius/loginradius-core)
│   ├── vanilla/             # Drop-in <script> usage, no bundler
│   └── playground/          # Vite + TypeScript exploration app
├── loginradius-js/          # All-in-one JS SDK (@loginradius/loginradius-js)
│   ├── vanilla/             # Plain HTML + CDN script
│   ├── playground/          # Vite + TypeScript playground
│   ├── angular/             # Angular 21
│   ├── next/                # Next.js 16 (App Router)
│   ├── nuxt/                # Nuxt 4
│   ├── solid/               # SolidJS + Vite
│   ├── svelte/              # Svelte 5 + Vite
│   └── vue/                 # Vue 3 + Vite
└── loginradius-react/       # React SDK (@loginradius/loginradius-react-sdk)
    ├── playground/          # Vite + React 19
    └── next/                # Next.js 16 + React 19
```

Pick the demo that matches your framework, copy it into your own repository, and replace the LoginRadius app credentials with your own.

## Available SDKs

| Package | npm | When to use |
|---|---|---|
| `@loginradius/loginradius-core` | [`@loginradius/loginradius-core`](https://www.npmjs.com/package/@loginradius/loginradius-core) | You need the lowest-level building blocks (auth controller, flow registry, schemas) and you're rolling your own UI. |
| `@loginradius/loginradius-js` | [`@loginradius/loginradius-js`](https://www.npmjs.com/package/@loginradius/loginradius-js) | You want a single bundle that ships pre-built UI plus the auth controller. Works from any framework or vanilla HTML. |
| `@loginradius/loginradius-react-sdk` | [`@loginradius/loginradius-react-sdk`](https://www.npmjs.com/package/@loginradius/loginradius-react-sdk) | You're building a React app and want first-class hooks (`useLoginRadiusSDK`, `useLRAuth`) and pre-built components. |

## Prerequisites

- **Node.js** 20.19+ or 22.12+
- **pnpm** 10+ (recommended — the repo uses a pnpm workspace), or use `npm`/`yarn` per individual demo
- A **LoginRadius app** — sign up at [loginradius.com](https://www.loginradius.com/) and grab your App Name from the Admin Console

## Quick start

Clone the repo and run any single demo:

```bash
git clone https://github.com/LoginRadius/loginradius-demos.git
cd loginradius-demos

# Install dependencies for every demo (workspace install)
pnpm install

# Run a specific demo
pnpm --filter @loginradius/demo-react-playground dev
pnpm --filter @loginradius/demo-js-next dev
```

Or treat any demo as a standalone project:

```bash
cd loginradius-js/vue
npm install
npm run dev
```

## Configuration

Every demo needs your LoginRadius **API Key** and **SOTT** (and usually a verification / reset / callback URL). Demos read these from environment variables; the variable name depends on the bundler:

| Framework | Variable prefix | File loaded |
|---|---|---|
| Vite (`playground`, `solid`, `svelte`, `vue`) | `VITE_LOGINRADIUS_*` | `.env.local` |
| Next.js (`loginradius-js/next`, `loginradius-react/next`) | `NEXT_PUBLIC_LOGINRADIUS_*` | `.env.local` |
| Nuxt | `NUXT_PUBLIC_LOGINRADIUS_*` | `.env` |
| Angular | n/a — edit `src/environments/environment.ts` | n/a |
| Vanilla HTML | n/a — edit `apiKey` / `sott` in `index.html` | n/a |

Typical variables (replace the prefix to match your demo):

```bash
# Vite-style — copy to .env.local inside the demo folder
VITE_LOGINRADIUS_API_KEY=your-api-key
VITE_LOGINRADIUS_SOTT=your-sott
VITE_LOGINRADIUS_VERIFICATION_URL=https://your-tenant.example.com/auth.aspx
VITE_LOGINRADIUS_RESET_PASSWORD_URL=https://your-tenant.example.com/auth.aspx
VITE_LOGINRADIUS_CALLBACK_URL=http://localhost:5000
```

> **Never commit real credentials.** `.env*` files are listed in `.gitignore`; the Angular `environment.ts` and the vanilla HTML files ship with `YOUR_API_KEY` / `YOUR_SOTT` placeholders that you must replace locally.

## Common commands

From the repo root:

```bash
pnpm install                                  # install everything
pnpm --filter <demo-name> dev                 # run a demo dev server
pnpm --filter <demo-name> build               # build a demo for production
pnpm -r --parallel build                      # build every demo
```

Per-demo (run inside the demo folder):

| Demo type | dev | build |
|---|---|---|
| Vite-based | `pnpm dev` | `pnpm build` |
| Next.js    | `pnpm dev` | `pnpm build` |
| Nuxt       | `pnpm dev` | `pnpm build` |
| Angular    | `pnpm dev` (`ng serve`) | `pnpm build` |
| Vanilla    | open `index.html` in a browser, or `npx serve .` | — |

## Troubleshooting

**"Module not found: `@loginradius/loginradius-*`"** — run `pnpm install` (or your package manager's install command) inside the demo folder.

**"App Name is invalid" / 401 from LoginRadius API** — verify your App Name in the LoginRadius Admin Console and that the corresponding env var is set before starting the dev server. Vite reads `.env.local` automatically; Next.js reads `.env.local`; Nuxt reads `.env`.

**CORS errors in the browser** — add your local dev URL (e.g. `http://localhost:5173`) to the **Allowed Domains** list in your LoginRadius app settings.

**Port already in use** — kill the process holding the port, or override with `--port`. Default ports per demo are documented in each demo's README.

**TypeScript complaining about missing types** — make sure you installed dependencies; the SDK ships its own `.d.ts` files via the npm package.

## SDK usage at a glance

### `@loginradius/loginradius-js` (single-bundle)

```ts
import { LoginRadiusSDK } from '@loginradius/loginradius-js';

const sdk = new LoginRadiusSDK({
  apiKey: import.meta.env.VITE_LOGINRADIUS_API_KEY,
  sott: import.meta.env.VITE_LOGINRADIUS_SOTT,
  callbackUrl: window.location.origin,
});

sdk.init('auth', { container: 'lr-auth' }); // renders login + registration into #lr-auth
```

### `@loginradius/loginradius-react-sdk` (React hooks + components)

```tsx
import { LoginRadiusProvider, AuthFlow } from '@loginradius/loginradius-react-sdk';

const options = {
  apiKey: import.meta.env.VITE_LOGINRADIUS_API_KEY,
  sott: import.meta.env.VITE_LOGINRADIUS_SOTT,
  callbackUrl: window.location.origin,
};

export default function App() {
  return (
    <LoginRadiusProvider options={options}>
      <AuthFlow onSuccess={(res) => console.log('auth success', res)} />
    </LoginRadiusProvider>
  );
}
```

### `@loginradius/loginradius-core` (BYO UI)

```ts
import LoginRadiusCore from '@loginradius/loginradius-core';

const lr = await LoginRadiusCore.createLoginRadius({
  apiKey: import.meta.env.VITE_LOGINRADIUS_API_KEY,
  sott: import.meta.env.VITE_LOGINRADIUS_SOTT,
});

await lr.controller.login({ email: 'user@example.com', password: '…' });
```

## Contributing

Issues and PRs are welcome. If you're adding a new framework demo, follow the structure of the closest existing demo and include a README using the same headings as the others.

## License

MIT © LoginRadius — see [LICENSE](LICENSE).
