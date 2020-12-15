const debug = require("debug")("dev:sellingPoints");
const createError = require("http-errors");
const sellingPointsValidation = require("../helpers/validations/sellingPoints.validation");
const categories = require("../helpers/categories.helper");
const SellingPoint = require("../models/sellingPoint.model");
const User = require("../models/user.model");
var ObjectId = require("mongoose").Types.ObjectId;

module.exports = {
  getAllMyOwnSellingPoints: async (req, res, next) => {
    try {
      const userId = req.payload.aud;

      const userExists = await User.find({ _id: userId });

      if (!userExists) {
        throw createError.Conflict(`User with ID ${userId} doensn't exist.`);
      }

      const sellingPoints = SellingPoint.find({
        createdBy: new ObjectId(userId),
      });

      // if no selling point is ever created mongoose will return the model object and that should not be send to the user
      if (Array.isArray(sellingPoints)) {
        res.send(sellingPoints);
      } else {
        res.send([]);
      }
    } catch (error) {
      debug(error.message);
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const userId = req.payload.aud;
      const validSellingPoint = await sellingPointsValidation.create.validateAsync(
        req.body
      );

      // the name should be stored in lower case
      validSellingPoint.name = validSellingPoint.name.toLowerCase();
      validSellingPoint.initials = validSellingPoint.initials.toLowerCase();

      // check if category exists
      if (!categories[validSellingPoint.category])
        throw createError.Conflict(
          `The category ${validSellingPoint.category} is not allowed.`
        );

      // add owner property with the user id from the request
      validSellingPoint.createdBy = new ObjectId(userId);

      const sellingPoint = new SellingPoint(validSellingPoint);
      const savedSellingPoint = await sellingPoint.save();

      res.send(savedSellingPoint);
    } catch (error) {
      if (error.isJoi === true) error.status = 422;

      debug(error.message);
      next(error);
    }
  },
  edit: async (req, res, next) => {
    res.send(`edit SELLING POINTS ${req.params.id}`);
  },
  delete: async (req, res, next) => {
    res.send(`delete SELLING POINTS ${req.params.id}`);
  },
};
