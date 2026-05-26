# `@loginradius/loginradius-react` demos

Reference apps that consume **[`@loginradius/loginradius-react`](https://www.npmjs.com/package/@loginradius/loginradius-react)** — the React-first SDK with first-class hooks and pre-built components.

| Demo | Stack | Default dev port |
|---|---|---|
| [`playground/`](./playground) | Vite + React 19 + React Router | `5000` |
| [`next/`](./next) | Next.js 16 (App Router) + React 19 | `3000` |

## What the React SDK gives you

- `<LoginRadiusProvider options={...}>` — wraps your tree, initializes the SDK, exposes it via context.
- `useLoginRadiusSDK()` — returns `{ lrInstance, options, loading, content }`.
- `useLRAuth()` — carries cross-step state (`email`, `phone`, `accessToken`, `mfaToken`, etc.) between flow steps.
- `<AuthFlow />`, `<LoginFlow />`, `<RegisterFlow />`, `<ProfileFlow />` — pre-built orchestrators that read from the flow registry and render the right step component for the user's current position.

Under the hood it composes [`@loginradius/loginradius-core`](../loginradius-core); pick this package when you want the controller plus React UI for the standard auth flows.

## Quick start

```bash
cd loginradius-react/playground   # or loginradius-react/next
pnpm install
cp .env.example .env.local        # see Configuration below
pnpm dev
```

## Configuration

| Demo | Var prefix | File |
|---|---|---|
| `playground` | `VITE_LOGINRADIUS_*` | `.env.local` |
| `next` | `NEXT_PUBLIC_LOGINRADIUS_*` | `.env.local` |

Variables read by these demos:

```bash
VITE_LOGINRADIUS_API_KEY=your-api-key
VITE_LOGINRADIUS_SOTT=your-sott
VITE_LOGINRADIUS_VERIFICATION_URL=https://your-tenant.example.com/auth.aspx
VITE_LOGINRADIUS_RESET_PASSWORD_URL=https://your-tenant.example.com/auth.aspx
VITE_LOGINRADIUS_CALLBACK_URL=http://localhost:5000
VITE_LOGINRADIUS_LOCALIZATION=true
```

For the Next.js demo, substitute the `NEXT_PUBLIC_LOGINRADIUS_*` prefix and keep the same suffixes.

## Common snippet

```tsx
import { LoginRadiusProvider, AuthFlow } from '@loginradius/loginradius-react';

const options = {
  apiKey: import.meta.env.VITE_LOGINRADIUS_API_KEY,
  sott: import.meta.env.VITE_LOGINRADIUS_SOTT,
  callbackUrl: window.location.origin,
};

export default function App() {
  return (
    <LoginRadiusProvider options={options}>
      <AuthFlow
        onSuccess={(res) => console.log('auth success', res)}
        onError={(err) => console.error('auth error', err)}
      />
    </LoginRadiusProvider>
  );
}
```
