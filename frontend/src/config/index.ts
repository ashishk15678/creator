interface Config {
  API_URL: string;
  APP_NAME: string;
  STORAGE_PREFIX: string;
}

const development: Config = {
  API_URL: "http://localhost:5000/api",
  APP_NAME: "Creator Dashboard",
  STORAGE_PREFIX: "creator_dash_",
};

const production: Config = {
  API_URL: "https://creator-n900.onrender.com/api",
  APP_NAME: "Creator Dashboard",
  STORAGE_PREFIX: "creator_dash_",
};

// Check if we're in production environment
const isProduction =
  process.env.NODE_ENV === "production" ||
  window.location.hostname === "creator-7553b.web.app" ||
  window.location.hostname === "creator-n900.onrender.com";

const config: Config = isProduction ? production : development;

export default config;
