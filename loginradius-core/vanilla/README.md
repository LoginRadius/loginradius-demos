<p align="center">
  <a href="https://www.loginradius.com" target="_blank" rel="noopener noreferrer">
    <img src="https://auth-dev.lrinternal.com/loginradius_favicon.svg" height="64" alt="LoginRadius logo" />
  </a>
</p>

<h1 align="center">LoginRadius Core SDK &mdash; Vanilla HTML Demo</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@loginradius/loginradius-core"><img src="https://img.shields.io/npm/v/@loginradius/loginradius-core.svg" alt="npm version" /></a>
  <a href="https://developer.mozilla.org/docs/Web/HTML"><img src="https://img.shields.io/badge/HTML-5-e34c26.svg" alt="HTML5" /></a>
  <a href="https://www.loginradius.com/docs"><img src="https://img.shields.io/badge/documentation-loginradius-blue.svg" alt="documentation" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
</p>

<p align="center">
  The simplest possible integration: a static HTML page loads <code>@loginradius/loginradius-core</code> from <code>auth.lrcontent.com</code> and drives a custom Google-style login UI by calling <code>controller.login(...)</code> and <code>controller.register(...)</code> directly &mdash; no bundler, no framework, no LoginRadius-provided UI.
</p>

<p align="center">
  Part of the <a href="../../README.md">LoginRadius Demos</a> monorepo. The underlying package is <a href="https://www.npmjs.com/package/@loginradius/loginradius-core"><code>@loginradius/loginradius-core</code></a>.
</p>

---

## 🚀 Get started with LoginRadius

1. [Sign up for an account](https://accounts.loginradius.com/auth.aspx?return_url=https://dashboard.loginradius.com/login).
2. Create an application in your LoginRadius Dashboard and grab your **API Key** and **SOTT**.
3. Add the origin you serve from (e.g. `http://localhost:3000`) to your app's **Allowed Domains** list.

### Prerequisites

- A modern browser
- Optional: a static file server (`npx serve`, `python -m http.server`, etc.) &mdash; required if your IdPs reject `file://` origins.

### Install

Nothing to install &mdash; the SDK loads from `https://auth.lrcontent.com/LoginRadiusCore.js`.

```bash
cd loginradius-core/vanilla
```

### Configure

Open [`index.html`](./index.html) and [`profile.html`](./profile.html) and replace the placeholders inside the `LoginRadiusCore` constructor call:

```js
const LRClient = new LoginRadiusCore({
  apiKey: 'YOUR_API_KEY',
  sott: 'YOUR_SOTT',
  callbackUrl: window.location.href,
  debugMode: true,
});
```

The constructor is invoked twice &mdash; once in `index.html` (for login / signup) and once in `profile.html` (for `getAccount` + logout). Mirror the credentials in both files.

> ⚠️ Both HTML files are checked into the repo. Replace placeholders **locally** and never commit real `apiKey`/`sott` values.

### Run

```bash
# Option 1 — open directly in a browser
open index.html

# Option 2 — serve over HTTP (recommended for social/SAML)
npx serve .
```

---

## 🧩 What this demo shows

- A single `<script src="https://auth.lrcontent.com/LoginRadiusCore.js">` tag exposes the global `LoginRadiusCore` constructor &mdash; the entire dependency graph fits in two HTML files.
- A two-step email → password flow that calls `LRClient.controller.checkEmailAvailability(...)` first, then `LRClient.controller.login(...)` only if the email is registered.
- Registration via `LRClient.controller.register(payload, onSuccess, onError)` with hand-built inputs &mdash; no schema renderer here, just plain `<input>` elements.
- Manual access-token persistence in `localStorage`, set on `onSuccess` and read in `profile.html` to call `controller.getAccount(token)`.
- A hand-rolled "Google-style" stylesheet in [`index.html`](./index.html) (CSS variables, drop shadows, centered card) &mdash; deliberately not the SDK's own theme.
- All UI is hand-built; the SDK contributes auth logic only. This is the lowest-level usage pattern in the repo.

---

## 🛠 Troubleshooting

| Symptom | Likely cause & fix |
|---|---|
| `LoginRadiusCore is not defined` | The CDN script tag didn't load. Check the browser Network tab and any CSP that blocks `auth.lrcontent.com`. |
| `401` from LoginRadius on first request | `apiKey` / `sott` placeholders weren't replaced &mdash; or you replaced only one of the two HTML files. |
| `CORS` error on any controller call | Add your served origin (`http://localhost:3000` etc.) to **Allowed Domains** in the Admin Console. |
| Social-login redirect lands on `file://` | Serve over HTTP; most IdPs reject opaque `file://` origins. |
| Profile page shows "session expired" immediately | `errorCode 905` means the cached token is no longer valid &mdash; clear `localStorage` and sign in again. |

---

## 🏁 Learning LoginRadius

The full LoginRadius documentation lives at [loginradius.com/docs](https://www.loginradius.com/docs).

- New to LoginRadius? Start with the [quickstart guides](https://www.loginradius.com/docs/).
- Want the same controller-level integration with TypeScript and Vite? See [`loginradius-core/playground/`](../playground/).
- Want the pre-built UI without writing your own forms? See [`loginradius-js/vanilla/`](../../loginradius-js/vanilla/).

---

## 🛟 Release notes

Curious what shipped recently? Browse the [`@loginradius/loginradius-core` releases](https://www.npmjs.com/package/@loginradius/loginradius-core?activeTab=versions) on npm.

---

## License

MIT.
