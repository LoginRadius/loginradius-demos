<p align="center">
  <a href="https://www.loginradius.com" target="_blank" rel="noopener noreferrer">
    <img src="https://auth-dev.lrinternal.com/loginradius_favicon.svg" height="64" alt="LoginRadius logo" />
  </a>
</p>

<h1 align="center">LoginRadius JS SDK &mdash; Vanilla HTML Demo</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@loginradius/loginradius-js"><img src="https://img.shields.io/npm/v/@loginradius/loginradius-js.svg" alt="npm version" /></a>
  <a href="https://developer.mozilla.org/docs/Web/HTML"><img src="https://img.shields.io/badge/HTML-5-e34c26.svg" alt="HTML5" /></a>
  <a href="https://www.unpkg.com"><img src="https://img.shields.io/badge/CDN-unpkg-000000.svg" alt="unpkg CDN" /></a>
  <a href="https://www.loginradius.com/docs"><img src="https://img.shields.io/badge/documentation-loginradius-blue.svg" alt="documentation" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
</p>

<p align="center">
  A zero-build HTML demo that loads the LoginRadius JS SDK from the unpkg CDN and mounts the pre-built auth UI into a <code>&lt;div&gt;</code> &mdash; no bundler, no framework, no <code>node_modules</code>.
</p>

<p align="center">
  Part of the <a href="../../README.md">LoginRadius Demos</a> monorepo. The underlying package is <a href="https://www.npmjs.com/package/@loginradius/loginradius-js"><code>@loginradius/loginradius-js</code></a>.
</p>

---

## 🚀 Get started with LoginRadius

1. [Sign up for an account](https://accounts.loginradius.com/auth.aspx?return_url=https://dashboard.loginradius.com/login).
2. Create an application in your LoginRadius Dashboard and grab your **API Key** and **SOTT**.
3. Add the origin you serve the file from (e.g. `http://localhost:3000`) to your app's **Allowed Domains** list.

### Prerequisites

- A modern browser
- Optional: a static file server (`npx serve`, `python -m http.server`, etc.) &mdash; recommended over `file://` to avoid origin/CORS quirks with social login and SAML IdPs.

### Install

Nothing to install &mdash; the SDK and stylesheet load from unpkg.

```bash
cd loginradius-js/vanilla
```

### Configure

Open [`index.html`](./index.html) and replace the placeholders inside the inline `commonOptions` object:

```js
var commonOptions = {
  apiKey: 'YOUR_API_KEY',
  sott: 'YOUR_SOTT',
  verificationUrl: 'https://your-tenant.example.com/auth.aspx',
  callbackUrl: window.location.origin,
  // ...
};
```

After a successful login, the page redirects to [`profile.html`](./profile.html) &mdash; mirror the same credentials there so the profile view can call `controller.getAccount(...)`.

> ⚠️ `index.html` and `profile.html` are checked into the repo. Replace placeholders **locally** and never commit real `apiKey`/`sott` values.

### Run

```bash
# Option 1 — open directly in a browser (limited; some IdPs reject file:// origins)
open index.html

# Option 2 — serve over HTTP (recommended)
npx serve .
```

---

## 🧩 What this demo shows

- The SDK runtime (`LoginRadiusV3.js`) and stylesheet (`LoginRadiusV3.css`) loaded from `https://unpkg.com/@loginradius/loginradius-js/dist/` &mdash; the `<link>` precedes the `<script>` so styles are applied before init.
- Instantiating `new LoginRadiusSDK(commonOptions)` directly inside an inline `<script>` &mdash; no bundler, no module system.
- The combined `auth` UI mounted into `#registration-container` via `LRObject.init('auth', { container, onSuccess, onError, hasFooter, onFooterClick })`.
- Customizing copy via `LRObject.$hooks.call('mapValidationMessages', [...])` and `mapErrorMessages` &mdash; the only documented way to tweak labels without a tenant template.
- The `onSuccess` callback navigating to `profile.html` once `response.access_token` is present &mdash; a hand-rolled post-auth redirect.
- A `?vtype=orginvite&vtoken=...` query handler that swaps the visible section, illustrating how to gate the demo behind an invite link.

---

## 🛠 Troubleshooting

| Symptom | Likely cause & fix |
|---|---|
| `LoginRadiusSDK is not defined` | unpkg `<script>` failed to load (network / CSP). Check the browser console and any CSP headers blocking `unpkg.com`. |
| Styles look broken | The `LoginRadiusV3.css` `<link>` tag must precede the runtime `<script>` so styles are present when init runs. |
| Social or SAML buttons do nothing | Serve over HTTP, not `file://` &mdash; many IdPs reject opaque origins. `npx serve .` is the easiest fix. |
| `401` / CORS error from LoginRadius | Add the served origin (`http://localhost:3000` etc.) to your app's **Allowed Domains**. |
| Redirect to `profile.html` 404s | Make sure both files are in the same served directory; the redirect uses a relative path. |

---

## 🏁 Learning LoginRadius

The full LoginRadius documentation lives at [loginradius.com/docs](https://www.loginradius.com/docs).

- New to LoginRadius? Start with the [quickstart guides](https://www.loginradius.com/docs/).
- Looking for other frameworks? Browse the sibling demos under [`loginradius-js/`](../) (Next.js, Nuxt, Vue, Svelte, Solid, Angular, TypeScript).

---

## 🛟 Release notes

Curious what shipped recently? Browse the [`@loginradius/loginradius-js` releases](https://www.npmjs.com/package/@loginradius/loginradius-js?activeTab=versions) on npm.

---

## License

MIT.
