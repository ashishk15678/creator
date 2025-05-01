interface Config {
  API_URL: string;
  APP_NAME: string;
  STORAGE_PREFIX: string;
}

const development: Config = {
  API_URL: "https://creator-n900.onrender.com/api",
  APP_NAME: "Creator Dashboard",
  STORAGE_PREFIX: "creator_dash_",
};

const production: Config = {
  API_URL: "https://creator-n900.onrender.com/api",
  APP_NAME: "Creator Dashboard",
  STORAGE_PREFIX: "creator_dash_",
};

const config: Config =
  process.env.NODE_ENV === "production" ? production : development;

export default config;
