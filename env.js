const dotenv = require("dotenv");

dotenv.config();

const requiredEnvVariables = [
  "MONGO_URI",
  "JWT_SECRET"
];

const missingVariables =
  requiredEnvVariables.filter(
    (variable) =>
      !process.env[variable]
  );

if (missingVariables.length > 0) {
  console.error(
    "Missing required environment variables:"
  );

  missingVariables.forEach(
    (variable) => {
      console.error(`- ${variable}`);
    }
  );

  process.exit(1);
}

const env = {
  NODE_ENV:
    process.env.NODE_ENV ||
    "development",

  PORT:
    Number(process.env.PORT) ||
    5000,

  MONGO_URI:
    process.env.MONGO_URI,

  JWT_SECRET:
    process.env.JWT_SECRET,

  JWT_EXPIRES_IN:
    process.env.JWT_EXPIRES_IN ||
    "7d",

  CLIENT_URL:
    process.env.CLIENT_URL ||
    "http://localhost:3000",

  LOG_LEVEL:
    process.env.LOG_LEVEL ||
    "dev"
};

env.isDevelopment =
  env.NODE_ENV === "development";

env.isProduction =
  env.NODE_ENV === "production";

env.isTest =
  env.NODE_ENV === "test";

module.exports = env;

