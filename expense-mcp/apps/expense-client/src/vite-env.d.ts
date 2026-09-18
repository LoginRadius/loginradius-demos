/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LR_AUTHORIZE_URL: string;
  readonly VITE_LR_CLIENT_ID: string;
  readonly VITE_LR_REDIRECT_URI: string;
  /**
   * REST resource identifier, including the `/api` mount path — it is sent as
   * the OAuth `resource` parameter and must match the server's
   * REST_RESOURCE_URL byte-for-byte or the issued token has the wrong audience.
   */
  readonly VITE_REST_RESOURCE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
