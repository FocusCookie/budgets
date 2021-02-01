const debug = require("debug")("dev:users");
const createError = require("http-errors");
const User = require("../models/user.model");
const Vault = require("../models/vault.model");
const userValidation = require("../helpers/validations/user.validation");
const jwt = require("../helpers/jwt.helper");
const bcrypt = require("bcrypt");
const redisClient = require("../init/redis.init");
var ObjectId = require("mongoose").Types.ObjectId;

module.exports = {
  getAllUsers: async (req, res, next) => {
    try {
      const tokenPayload = req.payload;
      const userRole = tokenPayload.role; // aud = user id, can be viewd in the jwt helper

      if (userRole !== "admin") {
        throw createError.Unauthorized();
      } else {
        const users = await User.find().select("-password -mainVault -__v");

        res.send(users);
      }
    } catch (error) {
      debug(error.message);
      next(error);
    }
  },

  edit: async (req, res, next) => {
    try {
      const validatedUpdate = await userValidation.edit.validateAsync(req.body);

      const tokenPayload = req.payload;
      const requesterUserId = tokenPayload.aud; // aud = user id, can be viewd in the jwt helper
      const requesterIsAdmin = tokenPayload.role; // aud = user id, can be viewd in the jwt helper
      const userIdToEdit = req.params.userId;

      const userToEditExist = await User.findOne({ _id: userIdToEdit });

      if (!userToEditExist) {
        throw createError.Conflict(
          `User with ID ${userIdToEdit} doesn't exists.`
        );
      }

      if (
        userToEditExist._id.toString() !== requesterUserId &&
        requesterIsAdmin !== "admin"
      ) {
        throw createError.Unauthorized();
      }

      // Check if the password needs to be update, if so hash the password first
      if (validatedUpdate.password) {
        // generate a salt to hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(
          validatedUpdate.password,
          salt
        );

        validatedUpdate.password = hashedPassword;
      }

      const updatedUser = await User.update(
        { _id: userIdToEdit },
        validatedUpdate
      );

      res.send(updatedUser);
    } catch (error) {
      if (error.isJoi === true) error.status = 422;

      debug(error.message);
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const tokenPayload = req.payload;
      const requesterUserId = tokenPayload.aud; // aud = user id, can be viewd in the jwt helper
      const requesterIsAdmin = tokenPayload.role; // aud = user id, can be viewd in the jwt helper
      const userIdToDelete = req.params.userId;

      const userToDelete = await User.findOne({ _id: userIdToDelete });

      if (!userToDelete) {
        throw createError.Conflict(
          `User with ID ${userIdToDelete} doesn't exists.`
        );
      }

      if (
        userToDelete._id.toString() !== requesterUserId &&
        requesterIsAdmin !== "admin"
      ) {
        throw createError.Unauthorized();
      }

      // revoke resfresh token for the user and than delete the user form the database
      redisClient.DEL(userIdToDelete, (err, value) => {
        if (err) {
          debug(err.message);
          throw createError.InternalServerError();
        } else {
          debug(
            `Refresh-Token for userId: ${userIdToDelete} successfully deleted.`
          );

          User.deleteOne({ _id: userIdToDelete }).then(() => {
            debug(`User with ID ${userIdToDelete} was successfull deleted`);
            res.status(204).send();
          });
        }
      });
    } catch (error) {
      debug(error.message);
      next(error);
    }
  },

  setMainVault: async (req, res, next) => {
    try {
      const tokenPayload = req.payload;
      const requesterUserId = tokenPayload.aud; // aud = user id, can be viewd in the jwt helper
      const userIdToSetMainVault = req.params.userId;
      const vaultId = req.params.vaultId;

      // check if vault exists
      const vaultExists = await Vault.findOne({ _id: vaultId });

      if (!vaultExists) {
        throw createError.Conflict(`Vault with ID ${vaultId} doesn't exists.`);
      }

      const userExists = await User.findOne({ _id: userIdToSetMainVault });

      // check if requester is the user of the vault or the vault has been shared with the user
      const vaultOwner = vaultExists.owner.toString();
      const vaultShared = vaultExists.shared.map((share) => share.toString());

      debug("requester ", requesterUserId);
      debug("owner of vault ", vaultExists.owner.toString());

      if (
        userExists._id.toString() !== requesterUserId ||
        (vaultOwner !== requesterUserId &&
          !vaultShared.some((share) => share === requesterUserId))
      ) {
        throw createError.Unauthorized();
      }

      const updatedUser = await User.update(
        { _id: userIdToSetMainVault },
        { mainVault: new ObjectId(vaultId) }
      );

      //TODO: Return the vault name? or the id?

      res.send(updatedUser);
    } catch (error) {
      debug(error.message);
      next(error);
    }
  },

  getUserIdByMail: async (req, res, next) => {
    try {
      const userMail = req.params.email;

      debug("PARA ", req.params);

      const user = await User.findOne({ email: userMail });

      if (!user)
        throw createError.Conflict(
          `User with e-mail: ${userMail} could not be found.`
        );

      res.send(user._id.toString());
    } catch (error) {
      debug(error.message);
      next(error);
    }
  },
};
