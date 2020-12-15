const users = require("../routes/users.route");
const expenses = require("../routes/expenses.route");
const auth = require("../routes/auth.route");
const vaults = require("../routes/vaults.route");
const debug = require("debug")("app:init-routes");
const createError = require("http-errors");

module.exports = (app) => {
  app.use("/auth", auth);
  app.use("/vaults", vaults);
  app.use("/users", users);
  app.use("/expenses", expenses);

  app.get("/", (req, res) => {
    res.send("This is the Budgets App.");
  });

  // Default all other Routes - 404
  app.use(async (req, res, next) => {
    next(createError.NotFound());
  });

  debug("Routes initialized");
};
