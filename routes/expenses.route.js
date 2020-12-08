const express = require("express");
const router = express.Router();
const ExspensesController = require("../controllers/expenses.controller");

router.get("/", ExspensesController.root);

module.exports = router;
