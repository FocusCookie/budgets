const express = require("express");
const router = express.Router();
const SellingPointsController = require("../controllers/sellingPoints.controller");
const { verfiyAccessToken } = require("../helpers/jwt.helper");

// Vaults
router.get(
  "/",
  verfiyAccessToken,
  SellingPointsController.getAllMyOwnSellingPoints
);
router.get(
  "/vault/:vaultId",
  verfiyAccessToken,
  SellingPointsController.getAllMyOwnSellingPoints
);
router.post("/", verfiyAccessToken, SellingPointsController.create);
router.put("/:id", verfiyAccessToken, SellingPointsController.edit);
router.delete("/:id", verfiyAccessToken, SellingPointsController.delete);

module.exports = router;
