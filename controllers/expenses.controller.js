const debug = require("debug")("dev:expenses");
const createError = require("http-errors");

module.exports = {
  root: (req, res) => {
    res.send("AUSGABEN");
  },
};
