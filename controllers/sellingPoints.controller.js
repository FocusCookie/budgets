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

      const userExists = await User.findOne({ _id: userId });

      if (!userExists) {
        throw createError.Conflict(`User with ID ${userId} doensn't exist.`);
      }

      const sellingPoints = await SellingPoint.find({
        owner: userId,
      }).select("-owner");

      res.send(sellingPoints);
    } catch (error) {
      debug(error.message);
      next(error);
    }
  },

  getSellingPointById: async (req, res, next) => {
    try {
      // check if the requester user exists
      const userId = req.payload.aud;
      const userExists = await User.findOne({ _id: userId });

      if (!userExists) {
        throw createError.Conflict(`User with ID ${userId} doensn't exist.`);
      }

      const sellingPointId = req.params.id;

      // check if the given id is valid
      if (!ObjectId.isValid(sellingPointId)) {
        throw createError.Conflict(`Invalid ID ${sellingPointId}.`);
      }

      // check the selling Point exists
      const sellingPoint = await SellingPoint.findOne({
        _id: sellingPointId,
      }).select("-createdBy");

      if (!sellingPoint) {
        throw createError.Conflict(
          `Selling Point with ID ${sellingPointId} doesn't exist.`
        );
      }

      res.send(sellingPoint);
    } catch (error) {
      debug(error.message);
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const userId = req.payload.aud;

      // check if the requester user exists
      const userExists = await User.findOne({ _id: userId });

      if (!userExists) {
        throw createError.Conflict(`User with ID ${userId} doensn't exist.`);
      }

      const validSellingPoint = await sellingPointsValidation.create.validateAsync(
        req.body
      );

      // the name should be stored in lower case
      validSellingPoint.name = validSellingPoint.name.toLowerCase();

      // check if category exists
      if (!categories.some((cat) => cat.title === validSellingPoint.category))
        throw createError.Conflict(
          `The category ${validSellingPoint.category} is not allowed.`
        );

      // add owner property with the user id from the request
      validSellingPoint.owner = new ObjectId(userId);

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
    try {
      const sellingPointId = req.params.id;
      const userId = req.payload.aud;

      // check if the requester user exists
      const userExists = await User.findOne({ _id: userId });

      if (!userExists) {
        throw createError.Conflict(`User with ID ${userId} doensn't exist.`);
      }

      const update = await sellingPointsValidation.edit.validateAsync(req.body);

      // check if category exists
      if (!categories[update.category])
        throw createError.Conflict(
          `The category ${update.category} is not allowed.`
        );

      // check if the given id is valid
      if (!ObjectId.isValid(sellingPointId)) {
        throw createError.Conflict(`Invalid ID ${sellingPointId}.`);
      }

      // check the selling Point exists
      const sellingPoint = await SellingPoint.findOne({
        _id: sellingPointId,
      });

      if (!sellingPoint) {
        throw createError.Conflict(
          `Selling Point with ID ${sellingPointId} doensn't exist.`
        );
      }

      // check if the requester is the owner of the selling point
      if (sellingPoint.owner.toString() !== userId) {
        throw createError.Unauthorized(
          "You are not the owner of the selling point"
        );
      } else {
        // update the selling point
        await SellingPoint.findOneAndUpdate({ _id: sellingPointId }, update);

        const updatedSellingPoint = await SellingPoint.findOne({
          _id: sellingPointId,
        });

        res.send(updatedSellingPoint);
      }
    } catch (error) {
      debug(error.message);
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const sellingPointId = req.params.id;
      const userId = req.payload.aud;

      // check if the requester user exists
      const userExists = await User.findOne({ _id: userId });

      if (!userExists) {
        throw createError.Conflict(`User with ID ${userId} doensn't exist.`);
      }

      // check if the given id is valid
      if (!ObjectId.isValid(sellingPointId)) {
        throw createError.Conflict(`Invalid ID ${sellingPointId}.`);
      }

      // check the selling Point exists
      const sellingPoint = await SellingPoint.findOne({
        _id: sellingPointId,
      });

      if (!sellingPoint) {
        throw createError.Conflict(
          `Selling Point with ID ${sellingPointId} doensn't exist.`
        );
      }

      // check if the requester is the owner of the selling point
      if (sellingPoint.owner.toString() !== userId) {
        throw createError.Unauthorized(
          "You are not the owner of the selling point"
        );
      } else {
        const deleted = await SellingPoint.deleteOne({ _id: sellingPointId });

        if (!deleted || (deleted.n === 0 && deleted.ok === 1)) {
          throw createError.Conflict(
            `Could not find a selling point with ID: ${vaultId}.`
          );
        }

        res.status(204).send();
      }
    } catch (error) {
      if (error.isJoi === true) error.status = 422;

      debug(error.message);
      next(error);
    }
  },
};
