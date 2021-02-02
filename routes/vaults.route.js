const express = require("express");
const router = express.Router();
const VaultsController = require("../controllers/vaults.controller");
const { verfiyAccessToken } = require("../helpers/jwt.helper");

// Vaults
router.get("/", verfiyAccessToken, VaultsController.getVaults);
router.post("/", verfiyAccessToken, VaultsController.createVault);
router.put("/:id", verfiyAccessToken, VaultsController.editVault);
router.delete("/:id", verfiyAccessToken, VaultsController.deleteVault);

// Vault Sharing
router.post("/:id/share", verfiyAccessToken, VaultsController.shareVaultWith);
router.delete("/:id/share", verfiyAccessToken, VaultsController.revokeSharing);

module.exports = router;
