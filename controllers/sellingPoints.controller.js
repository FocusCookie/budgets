const debug = require("debug")("dev:sellingPoints");
const createError = require("http-errors");

module.exports = {
  getAll: async (req, res, next) => {
    res.send("ALL SELLING POINTS");
  },
};
