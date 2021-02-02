const debug = require("debug")("dev:vaults");
const createError = require("http-errors");
const vaultsValidation = require("../helpers/validations/vaults.validation");
const Vault = require("../models/vault.model");
const User = require("../models/user.model");
var ObjectId = require("mongoose").Types.ObjectId;

module.exports = {
  getVaults: async (req, res, next) => {
    try {
      const tokenPayload = req.payload;
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

  get: async (req, res, next) => {
    try {
      const tokenPayload = req.payload;
      const userId = tokenPayload.aud; // aud = user id, can be viewd in the jwt helper
      const vaultId = req.params.id;

      // check if the given id is valid
      if (!ObjectId.isValid(vaultId)) {
        throw createError.Conflict(`Invalid ID ${vaultId}.`);
      }

      const vault = await Vault.findOne({ _id: vaultId });
      if (!vault) {
        throw createError.Conflict(
          `Could not find a vault with ID: ${vaultId}.`
        );
      }

      const isSharedWithUser = vault.shared.some(
        (id) => id.toString() === userId
      );
      const isOwnerOfTheVault = vault.owner.toString() === userId;

      if (isSharedWithUser || isOwnerOfTheVault) {
        res.send(vault);
      } else {
        next(createError.Unauthorized());
      }
    } catch (error) {
      debug(error.message);
      next(error);
    }
  },

  createVault: async (req, res, next) => {
    try {
      const tokenPayload = req.payload;

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

      // check if the given id is valid
      if (!ObjectId.isValid(vaultId)) {
        throw createError.Conflict(`Invalid ID ${vaultId}.`);
      }

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

      // check if the given id is valid
      if (!ObjectId.isValid(vaultId)) {
        throw createError.Conflict(`Invalid ID ${vaultId}.`);
      }

      const deleted = await Vault.deleteOne({ _id: vaultId });

      if (!deleted || (deleted.n === 0 && deleted.ok === 1)) {
        throw createError.Conflict(
          `Could not find a vault with ID: ${vaultId}.`
        );
      }

      res.status(204).send();
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
      const tokenPayload = req.payload;
      const ownerId = tokenPayload.aud; // aud = user id, can be viewd in the jwt helper
      const userEmail = req.body.email;

      // check if the given id is valid
      if (!ObjectId.isValid(vaultId)) {
        throw createError.Conflict(`Invalid ID ${vaultId}.`);
      }

      const user = await User.findOne({ email: userEmail });
      if (!user)
        throw createError.Conflict(`Couldn't find a user with ${userEmail}.`);

      const vault = await Vault.findOne({ _id: vaultId });
      if (!vault)
        throw createError.Conflict(`No vault found with ID: ${vaultId}`);

      if (vault.owner.toString() === ownerId) {
        //check if user is not already in shared listed
        if (
          vault.shared.some(
            (userId) => userId.toString() === user._id.toString()
          )
        ) {
          throw createError.Conflict(
            `The Vault is already shared with UserId: ${userEmail}`
          );
        } else {
          // add user to shared
          await Vault.update({ _id: vaultId }, { $push: { shared: user._id } });

          res.status(204).send();
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
      const tokenPayload = req.payload;
      const ownerId = tokenPayload.aud; // aud = user id, can be viewd in the jwt helper
      const userEmail = req.body.email;

      // check if the given id is valid
      if (!ObjectId.isValid(vaultId)) {
        throw createError.Conflict(`Invalid ID ${vaultId}.`);
      }

      const user = await User.findOne({ email: userEmail });
      if (!user)
        throw createError.Conflict(`The Vault is not shared with ${userEmail}`);

      const vault = await Vault.findOne({ _id: vaultId });
      if (!vault)
        throw createError.Conflict(`No vault found with ID: ${vaultId}`);

      if (vault.owner.toString() === ownerId) {
        //check if user is not already in shared listed
        if (
          vault.shared.some(
            (userId) => userId.toString() === user._id.toString()
          )
        ) {
          // remove user from shared
          await Vault.update({ _id: vaultId }, { $pull: { shared: user._id } });

          res.status(204).send();
        } else {
          throw createError.Conflict(
            `The Vault is not shared with ${userEmail}`
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

  getVaultShare: async (req, res, next) => {
    try {
      const vaultId = req.params.id;
      const userId = req.payload.aud; // aud = user id, can be viewd in the jwt helper

      // check if the given id is valid
      if (!ObjectId.isValid(vaultId)) {
        throw createError.Conflict(`Invalid ID ${vaultId}.`);
      }

      const vault = await Vault.findOne({ _id: vaultId });
      if (!vault)
        throw createError.Conflict(`No vault found with ID: ${vaultId}`);

      const isSharedWithUser = vault.shared.some(
        (user) => user.toString() === userId
      );

      const isOwner = vault.owner.toString() === userId;

      if (isSharedWithUser || isOwner) {
        const users = await User.find(
          { _id: vault.shared },
          { password: 0, __v: 0, role: 0 }
        );

        console.log(users);

        res.send(users);
      } else {
        next(createError.Unauthorized());
      }
    } catch (error) {
      debug(error.message);
      next(error);
    }
  },
};
