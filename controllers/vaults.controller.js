const debug = require("debug")("app:server");
const createError = require("http-errors");
const vaultsValidation = require("../helpers/validations/vaults.validation");
const jwt = require("../helpers/jwt.helper");
const Vault = require("../models/vault.model");
const User = require("../models/user.model");
var ObjectId = require("mongoose").Types.ObjectId;

module.exports = {
  getVaults: async (req, res) => {
    try {
      const tokenPayload = await jwt.getTokenPayload(req);
      const userId = tokenPayload.aud; // aud = user id, can be viewd in the jwt helper

      const searchQuery = {
        $or: [{ owner: userId }, { shared: userId }],
      };

      const vaults = await Vault.find(searchQuery);

      res.send(vaults);
    } catch (error) {
      debug(error.message);
      next(error);
    }
  },

  createVault: async (req, res, next) => {
    try {
      const tokenPayload = await jwt.getTokenPayload(req);

      const validVault = await vaultsValidation.create.validateAsync(req.body);

      const searchQuery = {
        $and: [
          { name: { $regex: validVault.name, $options: "i" } },
          { owner: tokenPayload.aud }, // aud = user id, can be viewd in the jwt helper
        ],
      };

      const vaultExists = await Vault.find(searchQuery);

      if (vaultExists.length !== 0) {
        throw createError.Conflict(
          `${validVault.name} is already registered for the user.`
        );
      }

      // the name should be stored in lower case
      validVault.name = validVault.name.toLowerCase();
      // add owner property with the user id from the request
      validVault.owner = tokenPayload.aud;

      const vault = new Vault(validVault);
      const savedVault = await vault.save();

      res.send(savedVault);
    } catch (error) {
      if (error.isJoi === true) error.status = 422;

      debug(error.message);
      next(error);
    }
  },

  editVault: async (req, res, next) => {
    try {
      const vaultId = req.params.id;

      const updatedValidVault = await vaultsValidation.create.validateAsync(
        req.body
      );

      // look up for the vault
      const vault = await Vault.findOneAndUpdate(
        { _id: vaultId },
        updatedValidVault
      );

      if (!vault) {
        throw createError.Conflict(
          `Could not find a vault with ID: ${vaultId}.`
        );
      }

      const editedVault = await Vault.findOne({ _id: vaultId });

      res.send(editedVault);
    } catch (error) {
      if (error.isJoi === true) error.status = 422;

      debug(error.message);
      next(error);
    }
  },

  deleteVault: async (req, res, next) => {
    try {
      const vaultId = req.params.id;

      const deleted = await Vault.deleteOne({ _id: vaultId });

      if (!deleted || (deleted.n === 0 && deleted.ok === 1)) {
        throw createError.Conflict(
          `Could not find a vault with ID: ${vaultId}.`
        );
      }

      res.send(deleted);
    } catch (error) {
      if (error.isJoi === true) error.status = 422;

      debug(error.message);
      next(error);
    }
  },

  // SHARING
  shareVaultWith: async (req, res, next) => {
    try {
      const vaultId = req.params.id;
      const tokenPayload = await jwt.getTokenPayload(req);
      const ownerId = tokenPayload.aud; // aud = user id, can be viewd in the jwt helper
      const userId = req.params.userId;

      const vault = await Vault.findOne({ _id: vaultId });

      if (!vault)
        res.send(createError.Conflict(`No vault found with ID: ${vaultId}`));

      if (vault.owner.toString() === ownerId) {
        //check if user is not already in shared listed
        if (
          vault.shared
            .map((userObj) => userObj.toString())
            .some((user) => user === userId)
        ) {
          res.send(
            createError.Conflict(
              `The Vault is already shared with UserId: ${userId}`
            )
          );
        } else {
          // add user to shared
          const updated = await Vault.update(
            { _id: vaultId },
            { $push: { shared: new ObjectId(userId) } }
          );

          res.send(updated);
        }
      } else {
        next(createError.Unauthorized());
      }
    } catch (error) {
      debug(error.message);
      next(error);
    }
  },

  revokeSharing: async (req, res, next) => {
    try {
      const vaultId = req.params.id;
      const tokenPayload = await jwt.getTokenPayload(req);
      const ownerId = tokenPayload.aud; // aud = user id, can be viewd in the jwt helper
      const userId = req.params.userId;

      const vault = await Vault.findOne({ _id: vaultId });

      if (vault.owner.toString() === ownerId) {
        //check if user is not already in shared listed
        if (
          vault.shared
            .map((userObj) => userObj.toString())
            .some((user) => user === userId)
        ) {
          // remove user from shared
          const updated = await Vault.update(
            { _id: vaultId },
            { $pull: { shared: new ObjectId(userId) } }
          );

          res.send(updated);
        } else {
          res.send(
            createError.Conflict(
              `The Vault is not shared with UserId: ${userId}`
            )
          );
        }
      } else {
        next(createError.Unauthorized());
      }
    } catch (error) {
      debug(error.message);
      next(error);
    }
  },
};
