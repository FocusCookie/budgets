const express = require("express");
const router = express.Router();
const UsersController = require("../controllers/users.controller");

router.get("/", UsersController.getAllUsers);
router.put("/:userId", UsersController.edit);
router.delete("/:userId", UsersController.delete);
router.post("/:userId/mainvault/:vaultId", UsersController.setMainVault);

module.exports = router;
