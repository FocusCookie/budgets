const dotenv = require("dotenv").config();

if (dotenv.error) {
  console.error(
    "Could not find .env file. Please setup your environment variables in a separate .env file."
  );
  process.exit(0);
}
