require("./init/env.init");
require("./init/mongoodb.init");
require("./init/adminAccount.init");
require("./init/redis.init");

const express = require("express");
const app = express();
const debug = require("debug")("app:server");
const path = require("path");

const cors = require("cors");

const environment = process.env.ENV;

// Enable cors ONLY FOR DEV
if (environment === "DEV") {
  debug("CORS is enabled for development.");
  app.use(cors());
} else {
  debug("CORS is disabled.");
}

const host = process.env.HOST;
const port = process.env.PORT;

// serve vue app
app.use(express.static(path.join(__dirname, "/dist")));

app.get("/", (req, res) => {
  debug("FILE PATH ", path.join(__dirname, "/dist/index.html"));
  res.sendFile(path.join(__dirname, "/dist/index.html"));
});

require("./init/app.init")(app);
require("./init/routes.init")(app);
require("./middlewares/error.middleware")(app);

app.listen(process.env.PORT, process.env.HOST, () => {
  debug(`Server is running at http://${host}:${port}/`);
});
