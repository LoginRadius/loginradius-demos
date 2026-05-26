# Vanilla JS Demo

A zero-build HTML demo that loads `@loginradius/loginradius-js` from the unpkg CDN and mounts the pre-built auth UI into a `<div>` — no bundler, no framework, no install required.

**Stack:** Plain HTML + CSS, SDK loaded via `<script src="unpkg.com/@loginradius/loginradius-js">`.

## Prerequisites

- A modern browser
- A simple static server if you want to avoid `file://` CORS quirks (optional: `npx serve`, Python `http.server`, etc.)

## Install

Nothing to install — the SDK ships from unpkg. Just open the files.

```bash
cd loginradius-js/vanilla
```

## Configure

Open `index.html` and replace the placeholder values inside the `commonOptions` object:

```js
var commonOptions = {
  apiKey: 'YOUR_API_KEY',
  sott: 'YOUR_SOTT',
  verificationUrl: 'https://your-tenant.example.com/auth.aspx',
  callbackUrl: window.location.origin,
  // ...
};
```

`profile.html` is opened automatically after a successful login (see the `onSuccess` callback). Edit any tenant-specific values there too.

## Run

```bash
# Option 1 — open directly in a browser
open index.html

# Option 2 — serve over HTTP (recommended; avoids file:// origin issues with social/SAML)
npx serve .
```

## What it demonstrates

- Loading the SDK runtime (`LoginRadiusV3.js`) and stylesheet (`LoginRadiusV3.css`) from unpkg.
- Instantiating `new LoginRadiusSDK(commonOptions)` directly in a `<script>` tag.
- Mounting the `auth` UI (combined login + register) into `#registration-container` via `LRObject.init('auth', { container, onSuccess, onError })`.
- Customizing validation and error copy via `LRObject.$hooks.call('mapValidationMessages', ...)` and `mapErrorMessages`.
- Redirecting to `profile.html` once the `onSuccess` callback receives an `access_token`.

## Troubleshooting

- **`LoginRadiusSDK is not defined`** — the unpkg script tag failed to load (network/CSP). Check the browser console and any Content Security Policy headers.
- **CORS / 401 on init** — your app's Allowed Domains list must include the origin you serve from (`http://localhost:3000`, `file://`, etc.).
- **Social or SAML buttons do nothing** — open over HTTP, not `file://`. Many IdPs reject opaque origins.
- **Styling looks broken** — the `LoginRadiusV3.css` `<link>` tag must load before the SDK script runs.
