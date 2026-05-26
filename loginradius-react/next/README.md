# Next.js Demo

A Next.js App Router demo that renders the LoginRadius `<Login>` component inside a client page, showing how to integrate `@loginradius/loginradius-react` with React Server Components.

**Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4, TypeScript 5

## Prerequisites
- Node.js >= 20.19
- pnpm >= 10 (or npm/yarn)
- A LoginRadius app with API Key and SOTT

## Install
```bash
cd loginradius-react/next
pnpm install
```

## Configure
Copy `.env.example` to `.env.local` and fill in your tenant values:

```bash
NEXT_PUBLIC_LOGINRADIUS_API_KEY=your-api-key
NEXT_PUBLIC_LOGINRADIUS_SOTT=your-sott
NEXT_PUBLIC_LOGINRADIUS_VERIFICATION_URL=https://your-tenant.example.com/auth.aspx
NEXT_PUBLIC_LOGINRADIUS_RESET_PASSWORD_URL=https://your-tenant.example.com/auth.aspx
NEXT_PUBLIC_LOGINRADIUS_CALLBACK_URL=http://localhost:3000
NEXT_PUBLIC_LOGINRADIUS_LOCALIZATION=true
```

Only `NEXT_PUBLIC_*` variables are exposed to the browser. Server-only secrets must not use this prefix.

## Run
```bash
pnpm dev       # dev server on http://localhost:3000
pnpm build     # production build (.next/)
pnpm start     # serve the production build
pnpm lint      # ESLint
```

## What it demonstrates
- `app/page.tsx` is marked `'use client'` because the SDK relies on browser APIs (storage, `window`, WebAuthn) and React context — server components cannot host `<LoginRadiusProvider>`.
- The provider is mounted inside the page itself rather than `app/layout.tsx`, keeping the rest of the layout server-rendered. To share auth state across routes, lift the provider into a dedicated client wrapper imported from `layout.tsx`.
- Renders the `<Login>` flow component (not the combined `<Auth>` flow) with `onSuccess` / `onError` callbacks typed as `ApiResponse<AuthResponse>` and `ApiError`.
- Demonstrates passing extra options (`OtpType: 'email'`, `OtpLength: 6`) alongside env-driven config.
- An `onLoading` callback toggles a DOM loader element, illustrating imperative DOM access from a client component.

## Troubleshooting
- **"You're importing a component that needs `useState`..."**: ensure `'use client'` is the first line of any file using the SDK, its hooks, or its components.
- **Env vars are `undefined` at runtime**: prefix with `NEXT_PUBLIC_` and restart `next dev`. Build-time inlining means a rebuild is needed after `.env.local` changes.
- **Hydration mismatch warning**: avoid rendering SDK state during SSR. Gate any post-auth UI behind a `useEffect`-set flag, or dynamically import the auth section with `ssr: false`.
- **CORS / 401 from LoginRadius APIs**: whitelist `http://localhost:3000` (and your production origin) under App Settings > Whitelist Domain in the Admin Console.
