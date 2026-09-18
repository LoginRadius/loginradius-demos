import { JWT, JWKS, JWKSObject } from "ts-jose";
import { config } from "@/config/index.js";

export interface TokenData {
  sub: string;
  expiresAt: number;
  scopes: string[];
  audience?: string | string[];
  act?: { sub: string };
  claims: Record<string, unknown>;
}

interface VerifyOptions {
  audience?: string | string[];
  issuer?: string | string[];
}

// Signing keys rotate rarely, so the parsed key set is cached rather than
// refetched on every verification.
const JWKS_CACHE_TTL_MS = 10 * 60 * 1000;

let jwksCache: { keys: JWKS; fetchedAt: number } | null = null;

async function getJwks(): Promise<JWKS> {
  if (jwksCache && Date.now() - jwksCache.fetchedAt < JWKS_CACHE_TTL_MS) {
    return jwksCache.keys;
  }

  const res = await fetch(config.LR.jwks);

  if (!res.ok) {
    throw new Error(`Failed to fetch JWKS: ${res.status} ${res.statusText}`);
  }

  const keys = await JWKS.fromObject((await res.json()) as JWKSObject);
  jwksCache = { keys, fetchedAt: Date.now() };

  return keys;
}

export async function verifyIdToken(
  token: string,
  options: VerifyOptions = {},
): Promise<TokenData | null> {
  try {
    const jwks = await getJwks();

    // Callers pass the exact set of acceptable issuers; default to the OIDC
    // app issuer only so nothing broader is trusted by accident.
    const issuers = options.issuer
      ? Array.isArray(options.issuer)
        ? options.issuer
        : [options.issuer]
      : [config.LR_ISSUER];

    const payload = (await JWT.verify(token, jwks, {
      issuer: issuers,
      ...(options.audience ? { audience: options.audience } : {}),
    })) as Record<string, unknown>;

    const scp = payload.scp as string | string[] | undefined;
    const scope = payload.scope as string | string[] | undefined;
    const scopes = Array.isArray(scp)
      ? scp
      : typeof scp === "string"
        ? scp.split(" ")
        : typeof scope === "string"
          ? scope.split(" ")
          : Array.isArray(scope)
            ? scope
            : [];

    return {
      sub: payload.sub as string,
      expiresAt: payload.exp as number,
      scopes,
      audience: payload.aud as string | string[] | undefined,
      act: payload.act
        ? { sub: (payload.act as Record<string, unknown>).sub as string }
        : undefined,
      claims: payload,
    };
  } catch (err) {
    console.log(err);
    return null;
  }
}
