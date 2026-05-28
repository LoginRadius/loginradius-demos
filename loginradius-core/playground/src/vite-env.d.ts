/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LOGINRADIUS_API_KEY: string;
  readonly VITE_LOGINRADIUS_SOTT: string;
  readonly VITE_LOGINRADIUS_VERIFICATION_URL: string;
  readonly VITE_LOGINRADIUS_RESET_PASSWORD_URL: string;
  readonly VITE_LOGINRADIUS_CALLBACK_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
