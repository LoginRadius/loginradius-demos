/**
 * Build-time environment, validated once at module load.
 *
 * Vite inlines `import.meta.env.*` into the bundle at build time, so a missing
 * variable reaches the browser as the literal string "undefined" and produces a
 * malformed authorization request that fails confusingly at the identity
 * provider. Failing here instead surfaces the real cause.
 */
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  lrAuthorizeUrl: required(
    "VITE_LR_AUTHORIZE_URL",
    import.meta.env.VITE_LR_AUTHORIZE_URL,
  ),
  lrClientId: required("VITE_LR_CLIENT_ID", import.meta.env.VITE_LR_CLIENT_ID),
  lrRedirectUri: required(
    "VITE_LR_REDIRECT_URI",
    import.meta.env.VITE_LR_REDIRECT_URI,
  ),
  restResourceUrl: required(
    "VITE_REST_RESOURCE_URL",
    import.meta.env.VITE_REST_RESOURCE_URL,
  ).replace(/\/+$/, ""),
} as const;

/**
 * Origin the expenses server is reached on. The OIDC callback and logout routes
 * are mounted at the root, not under the /api resource path, so they are built
 * from the origin of VITE_REST_RESOURCE_URL rather than from the value itself.
 */
export const serverOrigin = new URL(env.restResourceUrl).origin;

/**
 * LoginRadius hub origin, taken from the authorize URL. Used to end the session
 * the auth server keeps in its own HttpOnly cookie on that domain — clearing our
 * session cookie alone would leave the user silently signed in at the IdP, so
 * the next login would skip the prompt entirely.
 *
 * Read as an origin rather than by trimming the path, because the authorize URL
 * appears both as `/authorize` and as `/service/oidc/<app>/authorize`.
 */
export const lrHubOrigin = new URL(env.lrAuthorizeUrl).origin;
