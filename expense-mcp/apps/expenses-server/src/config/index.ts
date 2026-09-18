import { z } from "zod";

/**
 * Runtime-validated environment.
 *
 * This module is the only place in the server that reads `process.env`.
 * Everything else imports `config`, so a missing or malformed variable fails
 * at startup instead of surfacing as `undefined` deep inside a request.
 */
const envSchema = z.object({
  // Server
  PORT: z.string().default("3000").transform(Number),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Database
  DATABASE_PATH: z.string().default("./data/expense.db"),

  // LoginRadius. Every other LoginRadius URL is derived from this issuer —
  // see `deriveLoginRadiusEndpoints` below.
  LR_ISSUER: z
    .string()
    .url()
    .transform((url) => url.replace(/\/+$/, "")),
  // Issuer of service / token-exchange tokens (`iss` claim, must match
  // exactly). Accepted only by the REST API, never by the MCP endpoint.
  LR_SERVICE_ISSUER: z.string().url(),
  LR_CLIENT_ID: z.string().min(1, "LR_CLIENT_ID is required"),
  LR_CLIENT_SECRET: z.string().min(1, "LR_CLIENT_SECRET is required"),
  LR_TOKEN_ENDPOINT_AUTH_METHOD: z
    .enum(["client_secret_post", "client_secret_basic"])
    .default("client_secret_post"),

  // MCP resource identifier. Also the audience every MCP token is checked
  // against, so it is required rather than defaulted.
  MCP_RESOURCE_URL: z.string().url(),
  MCP_SERVER_NAME: z.string().default("Expense Management MCP Server"),
  MCP_SERVER_VERSION: z.string().default("1.0.0"),
  MCP_SERVER_ACTOR_SCOPES: z
    .string()
    .default(
      "expense:submit expense:view:own expense:view:team expense:view:all expense:approve expense:report:generate",
    ),

  // REST resource identifier. Includes the `/api` mount path so it is distinct
  // from MCP_RESOURCE_URL, and doubles as the base URL the MCP tools call back
  // into. Also the audience every REST token is checked against.
  REST_RESOURCE_URL: z
    .string()
    .url()
    .transform((url) => url.replace(/\/+$/, "")),

  // OIDC callback (React auth flow)
  OIDC_REDIRECT_URI: z.string().url(),

  // Cookie
  COOKIE_NAME: z.string().default("expense_session"),

  // CORS. Defaults to the Vite dev server so local development works unchanged.
  // In production the SPA and the API are served from one domain by nginx, so
  // requests are same-origin and this is never exercised.
  CORS_ORIGIN: z
    .string()
    .default("http://localhost:5173")
    .refine((value) => value.trim() !== "*", {
      message:
        'CORS_ORIGIN cannot be "*": every request from the client carries credentials, and browsers reject a wildcard origin on those. Name the client origin instead, comma-separated for more than one.',
    }),
});

/**
 * LoginRadius endpoints derived from `LR_ISSUER`. Only the endpoints the
 * server actually calls are listed — add a field here rather than a new
 * environment variable if another one is needed.
 */
interface LoginRadiusEndpoints {
  /** App-level JWKS used to verify every incoming access token. */
  jwks: string;
  /** Authorization-code token exchange for the browser login flow. */
  oidcToken: string;
  /** Tenant-level endpoint that mints service / actor tokens (RFC 8693). */
  serviceToken: string;
}

/**
 * `LR_ISSUER` has the shape
 *   https://<tenant>.hub.loginradius.com/service/oidc/<app-name>
 * App-level endpoints hang off the issuer itself; tenant-level ones hang off
 * its origin. The authorization-code token endpoint is the odd one out — it
 * is served under `/api`, not `/service`.
 */
const ISSUER_PATH_PATTERN = /^\/service\/oidc\/([^/]+)$/;

function deriveLoginRadiusEndpoints(issuer: string): LoginRadiusEndpoints {
  const { origin, pathname } = new URL(issuer);
  const match = ISSUER_PATH_PATTERN.exec(pathname);

  if (!match) {
    throw new Error(
      `LR_ISSUER must look like https://<tenant>.hub.loginradius.com/service/oidc/<app-name>, received "${issuer}"`,
    );
  }

  const appName = match[1];

  return {
    jwks: `${issuer}/jwks`,
    oidcToken: `${origin}/api/oidc/${appName}/token`,
    serviceToken: `${origin}/service/oauth/token`,
  };
}

type Config = z.infer<typeof envSchema> & {
  COOKIE_SECURE: boolean;
  LR: LoginRadiusEndpoints;
};

function loadConfig(): Config {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    console.error(z.prettifyError(result.error));
    process.exit(1);
  }

  try {
    return {
      ...result.data,
      COOKIE_SECURE: result.data.NODE_ENV === "production",
      LR: deriveLoginRadiusEndpoints(result.data.LR_ISSUER),
    };
  } catch (error) {
    console.error("❌ Invalid environment variables:");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

export const config = loadConfig();
