const debug = require("debug")("app:server");
const createError = require("http-errors");

module.exports = {
  root: (req, res) => {
    res.send("AUSGABEN");
  },
};
