/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TWITTER_API_KEY: string;
  readonly VITE_TWITTER_API_SECRET: string;
  readonly VITE_TWITTER_ACCESS_TOKEN: string;
  readonly VITE_TWITTER_ACCESS_SECRET: string;
  readonly VITE_LINKEDIN_CLIENT_ID: string;
  readonly VITE_LINKEDIN_CLIENT_SECRET: string;
  readonly VITE_LINKEDIN_ACCESS_TOKEN: string;
  readonly VITE_LINKEDIN_USER_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
