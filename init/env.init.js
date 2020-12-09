const dotenv = require("dotenv").config();
const debug = require("debug")("app:init-env");

if (dotenv.error) {
  console.error(
    "Could not find .env file. Please setup your environment variables in a separate .env file. To generate token secrets you can use the tokenSecrets.helper.js"
  );
  process.exit(0);
} else {
  debug("Environment variables initialized.");
}
