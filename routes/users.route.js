const express = require("express");
const router = express.Router();
const UsersController = require("../controllers/users.controller");
const { verfiyAccessToken } = require("../helpers/jwt.helper");

router.get("/", verfiyAccessToken, UsersController.getAllUsers);
router.put("/:userId", verfiyAccessToken, UsersController.edit);
router.delete("/:userId", verfiyAccessToken, UsersController.delete);
router.post(
  "/:userId/mainvault/:vaultId",
  verfiyAccessToken,
  UsersController.setMainVault
);

module.exports = router;
