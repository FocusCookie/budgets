const expenses = require("../routes/expenses.route");
const auth = require("../routes/auth.route");
const debug = require("debug")("app:init-routes");
const createError = require("http-errors");

module.exports = (app) => {
  app.use("/expenses", expenses);
  app.use("/auth", auth);

  app.get("/", (req, res) => {
    res.send("This is the Budgets App.");
  });

  // Default all other Routes - 404
  app.use(async (req, res, next) => {
    next(createError.NotFound());
  });

  debug("Routes initialized");
};
