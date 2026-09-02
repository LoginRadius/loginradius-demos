// Central config for the BBC B2C demo.
//
// This demo runs against a **B2C** LoginRadius tenant. `isB2BEnabled` is not a
// local switch — the SDK reads it from the tenant's app config. On a B2C tenant
// LoginRadiusProvider writes the PKCE access token into the standard token
// cache, which is what makes `useLRAuth().isAuthenticated` flip to true and the
// profile widgets work. Point this at a B2B tenant and none of that happens.

export const USE_SDK = process.env.NEXT_PUBLIC_USE_SDK !== "false";

// Where the IdP sends the browser back to with ?code=. Must be registered as an
// allowed redirect URI on the OIDC app, or the authorize call is rejected.
export const REDIRECT_PATH = "/account";

const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN?.trim();

const scopes = (process.env.NEXT_PUBLIC_OIDC_SCOPES || "openid profile email")
  .split(/\s+/)
  .filter(Boolean);

export const LOGIN_RADIUS_OPTIONS = {
  apiKey: process.env.NEXT_PUBLIC_LOGINRADIUS_API_KEY,
  oidcAppName: process.env.NEXT_PUBLIC_LOGINRADIUS_OIDC_APP_NAME,
  oidcClientId: process.env.NEXT_PUBLIC_LOGINRADIUS_CLIENT_ID,
  oidcRedirectUri:
    typeof window !== "undefined"
      ? window.location.origin + REDIRECT_PATH
      : "",
  oidcScopes: scopes,
  isMultiCustomDomainBrandingEnabled: true,
  customDomain: authDomain,
};

// Surfaced on the sign-in panel so a misconfigured .env.local fails loudly
// instead of bouncing the user to a blank hosted page.
export const MISSING_CONFIG = [
  ["NEXT_PUBLIC_LOGINRADIUS_API_KEY", LOGIN_RADIUS_OPTIONS.apiKey],
  ["NEXT_PUBLIC_LOGINRADIUS_OIDC_APP_NAME", LOGIN_RADIUS_OPTIONS.oidcAppName],
  ["NEXT_PUBLIC_LOGINRADIUS_CLIENT_ID", LOGIN_RADIUS_OPTIONS.oidcClientId],
]
  .filter(([, value]) => !value)
  .map(([name]) => name);
