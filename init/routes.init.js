const users = require("../routes/users.route");
const expenses = require("../routes/expenses.route");
const auth = require("../routes/auth.route");
const vaults = require("../routes/vaults.route");
const categories = require("../routes/categories.route");
const sellingPoints = require("../routes/sellingPoints.route");
const debug = require("debug")("app:init-routes");
const createError = require("http-errors");

module.exports = (app) => {
  app.use("/auth", auth);
  app.use("/vaults", vaults);
  app.use("/users", users);
  app.use("/categories", categories);
  app.use("/expenses", expenses);
  app.use("/sellingpoints", sellingPoints);

  // Default all other Routes - 404
  app.use(async (req, res, next) => {
    next(createError.NotFound());
  });

  debug("Routes initialized");
};
