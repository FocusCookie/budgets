const express = require("express");
const router = express.Router();
const { verfiyAccessToken } = require("../helpers/jwt.helper");
const ExspensesController = require("../controllers/expenses.controller");

router.get("/", verfiyAccessToken, ExspensesController.root);

module.exports = router;
