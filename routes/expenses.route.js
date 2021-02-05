const express = require("express");
const router = express.Router();
const { verfiyAccessToken } = require("../helpers/jwt.helper");
const ExspensesController = require("../controllers/expenses.controller");

// create exspense
router.post("/", verfiyAccessToken, ExspensesController.create);

// put exspense
router.put("/:expenseId", verfiyAccessToken, ExspensesController.edit);

// delete expense by id
router.delete("/:expenseId", verfiyAccessToken, ExspensesController.delete);

// get all expsenses for a vault PARAMTER BODY filters via searchParameters -> req.query array
router.get(
  "/vault/:vaultId/timeframe",
  verfiyAccessToken,
  ExspensesController.getVaultExpenses
);

router.get(
  "/vault/:vaultId",
  verfiyAccessToken,
  ExspensesController.getCurrentMonth
);

module.exports = router;
