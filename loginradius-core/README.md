# `@loginradius/loginradius-core` demos

Reference apps that consume **[`@loginradius/loginradius-core`](https://www.npmjs.com/package/@loginradius/loginradius-core)** — the framework-agnostic core. Use these as a starting point if you're building your own UI on top of the LoginRadius auth controller, flow registry, and schemas.

| Demo | Stack | When to use |
|---|---|---|
| [`vanilla/`](./vanilla) | Plain HTML + `<script>` from unpkg | Simplest possible drop-in; no bundler. |
| [`playground/`](./playground) | Vite + TypeScript | Exercise the core controller (login, register, MFA, schemas) from a typed sandbox. |

## What the core SDK gives you

- `LoginRadiusCore.createLoginRadius(options)` — initializes the SDK, fetches config + branding.
- `lr.controller.login(...)` / `register(...)` / `forgotPassword(...)` — the full auth API surface.
- `flowRegistry` — definition of every auth step (login, MFA, OTP, etc.) with `getNext` / `handleError` / `handleBack`.
- `SCHEMAS` + `lr.getSchema(name, content)` — pre-defined field definitions for every form.
- `apiClient` — low-level HTTP layer that handles SOTT headers and error mapping.

There's no UI here — bring your own framework and components, or use [`@loginradius/loginradius-js`](../loginradius-js) for an all-in-one bundle.

## Quick start

```bash
cd loginradius-core/playground
pnpm install
cp .env.example .env.local   # then edit the values
pnpm dev
```

For the vanilla demo, just open `vanilla/index.html` in a browser (or `npx serve loginradius-core/vanilla`) after replacing the placeholder `apiKey` / `sott` in the file.

## Configuration

Both demos require:

| Field | Where to get it |
|---|---|
| `apiKey` | LoginRadius Admin Console → App Settings |
| `sott` | Generated via the Admin Console or the `/sott` API endpoint |
| `verificationUrl` *(optional)* | The URL users land on after clicking an email-verification link |
| `resetPasswordUrl` *(optional)* | The URL for password-reset links |
| `callbackUrl` *(optional)* | Where social-login redirects land (defaults to `window.location.origin`) |

In the playground, set these via `.env.local`:

```bash
VITE_LOGINRADIUS_API_KEY=your-api-key
VITE_LOGINRADIUS_SOTT=your-sott
VITE_LOGINRADIUS_VERIFICATION_URL=https://your-tenant.example.com/auth.aspx
VITE_LOGINRADIUS_RESET_PASSWORD_URL=https://your-tenant.example.com/auth.aspx
VITE_LOGINRADIUS_CALLBACK_URL=http://localhost:5001
```

In the vanilla demo, edit the inline object inside `index.html` / `profile.html` directly.
