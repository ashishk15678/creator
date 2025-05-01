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
  API_URL: "https://vertx-creator-dash.onrender.com/api",
  APP_NAME: "Creator Dashboard",
  STORAGE_PREFIX: "creator_dash_",
};

const config: Config =
  process.env.NODE_ENV === "production" ? production : development;

export default config;
