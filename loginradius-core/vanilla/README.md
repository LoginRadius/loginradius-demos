# Vanilla Core Demo

The simplest possible integration: a static HTML page that loads `@loginradius/loginradius-core` from a CDN and drives a custom Google-style login UI by calling `controller.login(...)` / `controller.register(...)` directly.

**Stack:** Plain HTML/CSS/JS, no bundler.

## Run

No install needed. Just open the file in a browser, or serve the folder:

```bash
npx serve loginradius-core/vanilla
# then visit http://localhost:3000
```

## Configure

Open `index.html` and `profile.html` and replace these placeholders with values from your LoginRadius app:

```js
const LRClient = new LoginRadiusCore({
  apiKey: 'YOUR_API_KEY',
  sott: 'YOUR_SOTT',
  callbackUrl: window.location.href,
  debugMode: true,
});
```

The SDK runtime is loaded from `https://unpkg.com/@loginradius/loginradius-core/dist/`. If you want a pinned version or to self-host, change the `<script>` and `<link>` tags in the two HTML files.

## What it demonstrates

- Two-step email → password flow built on `controller.login()`.
- Account creation via `controller.register()`.
- Manual access-token storage in `localStorage`.
- Reading the authenticated user's profile via `controller.getAccount()` (in `profile.html`).
- All UI is hand-rolled — no LoginRadius-provided components are used.

## Troubleshooting

- **`LoginRadiusCore is not defined`** — the unpkg script tag didn't load. Check your network and verify the URL in `index.html`. If you self-host, make sure the path resolves.
- **401 from LoginRadius** — `apiKey` / `sott` placeholders weren't replaced.
- **CORS error** — add `http://localhost:3000` (or wherever you served from) to your LoginRadius app's Allowed Domains list.
