import LoginRadiusCore from '@loginradius/loginradius-core';

const env = import.meta.env;

const requireEnv = (key: keyof ImportMetaEnv): string => {
  const value = env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${String(key)}. ` +
        `Copy .env.example to .env.local and fill in your LoginRadius credentials.`,
    );
  }
  return String(value);
};

export const sdkOptions = {
  apiKey: requireEnv('VITE_LOGINRADIUS_API_KEY'),
  sott: requireEnv('VITE_LOGINRADIUS_SOTT'),
  verificationUrl: env.VITE_LOGINRADIUS_VERIFICATION_URL as string | undefined,
  resetPasswordUrl: env.VITE_LOGINRADIUS_RESET_PASSWORD_URL as
    | string
    | undefined,
  callbackUrl:
    (env.VITE_LOGINRADIUS_CALLBACK_URL as string | undefined) ||
    window.location.origin,
  debugMode: env.DEV,
};

export const initSDK = (): Promise<LoginRadiusCore> =>
  LoginRadiusCore.createLoginRadius(sdkOptions);

export type { LoginRadiusCore };
