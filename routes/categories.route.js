const express = require("express");
const router = express.Router();
const CategoriesController = require("../controllers/categories.controller");
const { verfiyAccessToken } = require("../helpers/jwt.helper");

router.get("/", verfiyAccessToken, CategoriesController.getAll);

module.exports = router;
