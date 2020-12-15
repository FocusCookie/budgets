const debug = require("debug")("dev:categories");
const categories = require("../helpers/categories.helper");

module.exports = {
  getAll: async (req, res, next) => {
    res.send(categories);
  },
};
