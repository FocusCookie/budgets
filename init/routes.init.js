const express = require("express");
const helmet = require("helmet"); //Helmet helps you secure your Express apps by setting various HTTP headers. It's not a silver bullet, but it can help!
const errorMiddleware = require("../middleware/error");
const createError = require("http-errors");

const expenses = require("../routes/expenses.route");

module.exports = (app) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(helmet());

  app.use("/expenses", expenses);

  app.get("/", (req, res) => {
    res.send("This is the Budgets App.");
  });

  // Default 404 Route
  app.use(async (req, res, next) => {
    next("404 - Page not found.");
  });

  app.use(errorMiddleware);
};
