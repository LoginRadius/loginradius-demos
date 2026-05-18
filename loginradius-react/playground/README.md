# Vite + React Demo

A Vite-powered React SPA that mounts the LoginRadius `<Auth>` flow at `/` and a profile view at `/user`, demonstrating end-to-end authentication with `@loginradius/loginradius-react-sdk`.

**Stack:** Vite 7, React 19, React Router 6, lucide-react, js-cookie, TypeScript 5

## Prerequisites
- Node.js >= 20.19
- pnpm >= 10 (or npm/yarn)
- A LoginRadius app with API Key and SOTT

## Install
```bash
cd loginradius-react/playground
pnpm install
```

## Configure
Copy `.env.example` to `.env.local` and fill in your tenant values:

```bash
VITE_LOGINRADIUS_API_KEY=your-api-key
VITE_LOGINRADIUS_SOTT=your-sott
VITE_LOGINRADIUS_VERIFICATION_URL=https://your-tenant.example.com/auth.aspx
VITE_LOGINRADIUS_RESET_PASSWORD_URL=https://your-tenant.example.com/auth.aspx
VITE_LOGINRADIUS_CALLBACK_URL=http://localhost:5000
VITE_LOGINRADIUS_LOCALIZATION=true
```

Only variables prefixed with `VITE_` are exposed to the browser. Restart `pnpm dev` after editing.

## Run
```bash
pnpm dev       # dev server on http://localhost:5000
pnpm build     # type-check + production build to dist/
pnpm preview   # serve the production build locally
```

## What it demonstrates
- `src/main.tsx` wraps the entire router tree in `<LoginRadiusProvider>`, reading config from `import.meta.env.VITE_LOGINRADIUS_*` and forwarding an `onLoading` callback that toggles a DOM loader.
- An optional `?brand=<templateName>` query param is forwarded as `templateName` so a single deploy can switch branding at runtime.
- `src/app/auth.tsx` renders the combined `<Auth>` flow component, which the SDK drives through login / register / MFA / verification steps based on tenant config.
- `onSuccess` checks for `access_token` and calls `useNavigate('/user')` to transition to the profile route, showing how to integrate the SDK with React Router.
- `onError` receives a typed `ApiError`; here it is logged, but production code should surface it via `useMessageDisplay`.

## Troubleshooting
- **Blank screen / "apiKey is required"**: `.env.local` missing or variables not prefixed with `VITE_`. Restart the dev server after edits.
- **CORS or 401 from `api.loginradius.com`**: the current origin (`http://localhost:5000`) must be whitelisted in the LoginRadius Admin Console under App Settings > Whitelist Domain.
- **Port 5000 already in use**: pass `--port 5173` to `vite` or free the port. Update `VITE_LOGINRADIUS_CALLBACK_URL` to match.
- **`/user` 404 on refresh**: when serving the production build, configure your host to fall back to `index.html` for client-side routes.
