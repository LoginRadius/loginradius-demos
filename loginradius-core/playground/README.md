# LoginRadius Core — TypeScript Demo

A minimal, framework-agnostic **single-page** app that integrates the
[`@loginradius/loginradius-core`](https://www.npmjs.com/package/@loginradius/loginradius-core)
npm package against a real LoginRadius tenant. Built with Vite + TypeScript,
no UI framework — bring your own.

> Sibling demo: [`../vanilla/`](../vanilla/) — same flows, loaded from a CDN
> `<script>` tag instead of via npm. Use whichever is closer to your stack.

---

## What it demonstrates

| SDK surface                              | Where it's used                                                              |
| ---------------------------------------- | ---------------------------------------------------------------------------- |
| `LoginRadiusCore.createLoginRadius(...)` | [`src/sdk.ts`](./src/sdk.ts) — async init with env-validated options         |
| `controller.checkEmailAvailability(...)` | [`flows/login.ts`](./src/flows/login.ts) — two-step email→password gate      |
| `controller.login(...)`                  | [`flows/login.ts`](./src/flows/login.ts) — credential submit                 |
| `controller.register(...)`               | [`flows/signup.ts`](./src/flows/signup.ts) — registration submit             |
| `controller.getAccount(token)`           | [`flows/profile.ts`](./src/flows/profile.ts) — load authenticated profile    |
| `controller.ssoLogout(...)`              | [`flows/profile.ts`](./src/flows/profile.ts) — sign-out + local token clear  |
| `getSchema('loginFormSchema')`           | [`flows/login.ts`](./src/flows/login.ts) — schema-driven password fields     |
| `getSchema('registrationFormSchema')`    | [`flows/signup.ts`](./src/flows/signup.ts) — schema-driven registration form |

The UI is hand-rolled HTML/CSS — the SDK contributes auth logic and form
schemas only.

---

## Quick start

```bash
pnpm install
cp .env.example .env.local           # fill in your LoginRadius credentials
pnpm dev                             # http://localhost:5001
```

### Prerequisites

- Node.js ≥ 20.19
- pnpm ≥ 10 (or npm / yarn)
- A LoginRadius app — get `apiKey` and `sott` from the
  [LoginRadius Admin Console](https://adminconsole.loginradius.com/)
- Add `http://localhost:5001` to **App Settings → Allowed Domains**, or CORS
  preflights will fail.

### Configuration

`.env.local` is loaded by Vite. The bootstrap in [`src/sdk.ts`](./src/sdk.ts)
throws an actionable error if a required variable is missing.

| Variable                              | Required | Notes                                                      |
| ------------------------------------- | -------- | ---------------------------------------------------------- |
| `VITE_LOGINRADIUS_API_KEY`            | yes      | App key from the Admin Console.                            |
| `VITE_LOGINRADIUS_SOTT`               | yes      | Secure One-Time Token (registration anti-abuse signature). |
| `VITE_LOGINRADIUS_VERIFICATION_URL`   | no       | Where users land after clicking an email-verify link.      |
| `VITE_LOGINRADIUS_RESET_PASSWORD_URL` | no       | Where reset-password links land.                           |
| `VITE_LOGINRADIUS_CALLBACK_URL`       | no       | Social-login callback (defaults to `window.location.origin`). |

---

## Project structure

```
playground/
├── index.html              # single-page shell — all screens live here
├── vite.config.ts          # dev: 5001, preview: 4301
├── tsconfig.json
└── src/
    ├── main.ts             # bootstrap: init SDK, wire flows, resume session
    ├── sdk.ts              # createLoginRadius() — validates env, returns instance
    ├── session.ts          # access-token persistence (localStorage)
    ├── screens.ts          # screen show/hide + auth↔profile card swap
    ├── schemaForm.ts       # schema → HTML field renderer (input/email/password/checkbox/select)
    ├── dom.ts              # $, $$, escapeHtml, setError/clearError, isValidEmail
    ├── styles.css          # global stylesheet
    ├── env.d.ts            # typed import.meta.env
    └── flows/
        ├── login.ts        # email-availability check + sign-in (schema-driven password)
        ├── signup.ts       # registration (schema-driven, with fallback messaging)
        └── profile.ts      # getAccount + ssoLogout, token-expiry handling
```

Each `flows/*.ts` module owns one user journey and exposes a small public
surface; [`main.ts`](./src/main.ts) is the only place that wires them
together. Add a new flow (forgot-password, MFA, social login) by dropping a
file in `flows/` and registering it in `main.ts`.

---

## How it works

The SDK is initialized once at bootstrap and the instance is shared across
flows:

```ts
import LoginRadiusCore from '@loginradius/loginradius-core';

const lrCore = await LoginRadiusCore.createLoginRadius({
  apiKey: import.meta.env.VITE_LOGINRADIUS_API_KEY,
  sott:   import.meta.env.VITE_LOGINRADIUS_SOTT,
  // ...
});
```

Authenticated calls go through `lrCore.controller.*`, which accepts a
`(payload, onSuccess, onError)` callback signature:

```ts
await lrCore.controller.login(
  { emailid, password },
  (res) => { /* persist token, swap to profile screen */ },
  (err) => { /* show inline error */ },
);
```

On page load, if an access token is already in `localStorage` the app skips
the login screen and calls `getAccount` directly. If the token has expired
(`errorCode === 905`) the session is cleared and the user is returned to the
email screen — no redirect loops.

---

## Scripts

| Command        | What it does                                              |
| -------------- | --------------------------------------------------------- |
| `pnpm dev`     | Vite dev server with HMR on http://localhost:5001         |
| `pnpm build`   | Production build into `dist/`                             |
| `pnpm preview` | Serve the production build on http://localhost:4301      |

---

## Production checklist

This is a **demo**. Before adopting the patterns here in production:

- **Token storage**: `localStorage` is used for simplicity. Prefer HTTP-only,
  `Secure`, `SameSite=Strict` cookies (set by your backend) or in-memory
  storage with short-lived access tokens + refresh-token rotation to mitigate
  XSS exposure.
- **CSP**: ship a Content-Security-Policy that pins the LoginRadius endpoints
  and disallows inline scripts in environments where you can.
- **Allowed Domains**: lock the Admin Console list to your real origins; do
  not leave wildcards or `localhost` enabled in production tenants.
- **SOTT rotation**: SOTT values can be scoped and time-limited — rotate them
  according to your security posture.
- **Schema validation**: the schema-driven renderer here renders whatever the
  tenant config returns. If you tighten field types in the Admin Console, the
  UI follows automatically; the reverse is not true.
- **Logging**: `debugMode: true` is enabled in dev only via
  [`sdk.ts`](./src/sdk.ts) (`import.meta.env.DEV`). Verify it is off in prod
  builds before shipping.
- **Never commit secrets**: `.env.local` is git-ignored. Do not paste
  `apiKey` / `sott` into the source, into chat tools, or into screenshots.

---

## Troubleshooting

| Symptom                                              | Likely cause                                                                                       |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `Missing required environment variable`              | `.env.local` not present, or the variable name is missing the `VITE_` prefix.                      |
| CORS / 401 in the Network tab                        | Current origin isn't in the app's **Allowed Domains** list.                                        |
| `loginFormSchema unavailable, using fallback`        | Tenant template config isn't provisioned — the static password field is rendered instead. Safe to ignore for the demo. |
| Stuck on the profile spinner / `errorCode 905`       | Expired token. The app clears it automatically and returns you to sign-in.                         |
| `apiKey is undefined` in the console                 | Env file isn't being picked up — restart the Vite dev server after editing `.env.local`.            |

---

## Related

- [`@loginradius/loginradius-core` on npm](https://www.npmjs.com/package/@loginradius/loginradius-core)
- [`../vanilla/`](../vanilla/) — CDN/script-tag equivalent of this demo
- [`../README.md`](../README.md) — top-level overview of all core SDK demos
- [LoginRadius developer docs](https://www.loginradius.com/docs/)

## License

MIT — see the [repository root](../../) for license details.
