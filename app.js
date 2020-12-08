require("./init/env.init");

const express = require("express");
const app = express();
const debug = require("debug")("app:server");

const host = process.env.HOST;
const port = process.env.PORT;

require("./init/routes.init")(app);

app.listen(process.env.PORT, process.env.HOST, () => {
  debug(`Server is running at http://${host}:${port}/`);
});
