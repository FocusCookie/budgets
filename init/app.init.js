const express = require("express");
require("express-async-errors"); // to handle async errors/exceptions
const helmet = require("helmet"); //Helmet helps you secure your Express apps by setting various HTTP headers. It's not a silver bullet, but it can help!
const morgan = require("morgan"); // HTTP request logger middleware for node.js
const debug = require("debug")("app:init-app");

module.exports = (app) => {
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(helmet());

  debug("App and Middlewares initialized");
};
