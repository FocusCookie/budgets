const { request } = require("http");

const debug = require("debug")("app:error");
const requestDebug = require("debug")("app:request");

module.exports = function (err, req, res, next) {
  if (!err) {
    console.log("HIER");
    requestDebug(req.method + " " + req.path);
    next();
  } else {
    debug(req.method + " " + req.path);
    debug(err);
    next();
  }
};
