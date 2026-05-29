// Centralized feature flags. Toggle via VITE_USE_SDK in .env.local.
// Defaults to true (render SDK widgets); set "false" to render the mock UI.
export const USE_SDK = import.meta.env.VITE_USE_SDK !== "false";

export const LOGIN_RADIUS_OPTIONS = {
  apiKey: import.meta.env.VITE_LOGINRADIUS_API_KEY,
  oidcAppName: import.meta.env.VITE_LOGINRADIUS_OIDC_APP_NAME,
  oidcClientId: import.meta.env.VITE_LOGINRADIUS_CLIENT_ID,
  oidcRedirectUri:
    typeof window !== "undefined" ? window.location.origin + "/admin" : "",
  customDomain: import.meta.env.VITE_AUTH_DOMAIN
};
