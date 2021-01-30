const debug = require("debug")("dev:expenses");
const createError = require("http-errors");
const SellingPoint = require("../models/sellingPoint.model");
const User = require("../models/user.model");
const Vault = require("../models/vault.model");
const Expense = require("../models/expense.model");
const expensesValidation = require("../helpers/validations/expenses.validation");
const bcrypt = require("bcrypt");
var ObjectId = require("mongoose").Types.ObjectId;

module.exports = {
  create: async (req, res, next) => {
    try {
      const validatedExpense = await expensesValidation.create.validateAsync(
        req.body
      );

      const { sum, type, sellingPoint, vault } = validatedExpense;
      const userId = req.payload.aud;

      // check that every given id is a valid ObjectId
      if (!ObjectId.isValid(sellingPoint) || !ObjectId.isValid(vault)) {
        throw createError.Conflict(`Invalid selling point or vault ID.`);
      }

      // check if the requester user exists
      const user = await User.findOne({ _id: userId });
      if (!user) {
        throw createError.Unauthorized();
      }

      // check if vault exists and check if user has acces to the vault
      const vaultExists = await Vault.findOne({ _id: vault });

      if (!vaultExists) {
        throw createError.Conflict(`Vault with ID ${vault} doensn't exist.`);
      } else {
        const userIsVaultOwner = vaultExists.owner.toString() === userId;
        const vaultIsSharedWithUser = vaultExists.shared
          ? vaultExists.shared.map((el) => el.toString()).includes(userId)
          : false;

        if (!userIsVaultOwner && !vaultIsSharedWithUser)
          throw createError.Unauthorized();
      }

      // check if the selling ppoint exists
      const sellingPointExists = await SellingPoint.findOne({
        _id: sellingPoint,
      });
      if (!sellingPointExists) {
        throw createError.Conflict(
          `Selling Point with ID ${sellingPoint} doensn't exist.`
        );
      }

      // check if selling point is already attached to the vault
      const sellingPointExistInVault = vaultExists.sellingPoints
        .map((el) => el.toString())
        .includes(sellingPoint);

      // if the sellingPoint is not attached to the vault attach it
      if (!sellingPointExistInVault) {
        // store sellingPoint in vault
        await Vault.update(
          { _id: vault },
          { $push: { sellingPoints: new ObjectId(sellingPoint) } }
        );
      }

      // convert the id strings into mongoose Object ids
      validatedExpense.vault = vaultExists._id;
      validatedExpense.sellingPoint = sellingPointExists._id;

      // convert sum into string and hash it
      const salt = await bcrypt.genSalt(10);
      const roundedSumAsString = Math.round(sum.toFixed(2)).toString();
      const hashedSum = await bcrypt.hash(roundedSumAsString, salt);
      validatedExpense.sum = hashedSum;

      // add owner of the Expense
      validatedExpense.owner = new ObjectId(userId);

      // initialize the images and comments array
      validatedExpense.comments = [];
      validatedExpense.images = [];

      // store expense
      const expense = new Expense(validatedExpense);
      const savedExpense = await expense.save();
      validatedExpense._id = savedExpense._id.toString();

      res.send(savedExpense);
    } catch (error) {
      if (error.isJoi === true) error.status = 422;

      debug(error.message);
      next(error);
    }
  },

  edit: async (req, res, next) => {
    try {
      const validatedExpense = await expensesValidation.edit.validateAsync(
        req.body
      );
      const expenseId = req.params.expenseId;

      // type is not used because if its given it will be checked by validation!
      const { sum, type, sellingPoint } = validatedExpense;
      const userId = req.payload.aud;

      //check if expense exists
      const expenseExists = await Expense.findOne({ _id: expenseId });
      if (!expenseExists)
        throw createError.Conflict(
          `Expense with ID ${sellingPoint} doensn't exist.`
        );

      // check that every given id is a valid ObjectId
      if (sellingPoint && !ObjectId.isValid(sellingPoint)) {
        throw createError.Conflict(`Invalid selling point or vault ID.`);
      }

      // check if the requester user exists
      const user = await User.findOne({ _id: userId });
      if (!user) {
        throw createError.Unauthorized();
      }

      // check if vault exists and check if user has acces to the vault
      let vaultExists;
      let userIsVaultOwner;
      let vaultIsSharedWithUser;

      vaultExists = await Vault.findOne({ _id: expenseExists.vault });

      if (!vaultExists) {
        throw createError.Conflict(
          `Vault with ID ${expenseExists.vault} doensn't exist.`
        );
      } else {
        userIsVaultOwner = vaultExists.owner.toString() === userId;
        vaultIsSharedWithUser = vaultExists.shared
          ? vaultExists.shared.map((el) => el.toString()).includes(userId)
          : false;

        if (!userIsVaultOwner && !vaultIsSharedWithUser)
          throw createError.Unauthorized();
      }

      let sellingPointExists;
      if (sellingPoint) {
        // check if the selling ppoint exists
        sellingPointExists = await SellingPoint.findOne({
          _id: sellingPoint,
        });
        if (!sellingPointExists) {
          throw createError.Conflict(
            `Selling Point with ID ${sellingPoint} doensn't exist.`
          );
        }

        // store sellingPoint in vault
        await Vault.update(
          { _id: expenseExists.vault },
          { $push: { sellingPoints: new ObjectId(sellingPoint) } }
        );
      }

      // convert the id strings into mongoose Object ids
      if (sellingPoint) validatedExpense.sellingPoint = sellingPointExists._id;

      // convert sum into string and hash it
      if (sum) {
        const salt = await bcrypt.genSalt(10);
        const roundedSumAsString = Math.round(sum.toFixed(2)).toString();
        const hashedSum = await bcrypt.hash(roundedSumAsString, salt);
        validatedExpense.sum = hashedSum;
      }

      // add owner of the Expense
      validatedExpense.owner = new ObjectId(userId);

      // initialize the images and comments array
      validatedExpense.comments = [];
      validatedExpense.images = [];

      // Update the expense
      const expense = await Expense.findOneAndUpdate(
        { _id: expenseId },
        validatedExpense
      );

      if (!expense) {
        throw createError.Conflict(
          `Could not find a expense with ID: ${expenseId}.`
        );
      }

      const editedExpense = await Expense.findOne({ _id: expenseId });

      res.send(editedExpense);
    } catch (error) {
      if (error.isJoi === true) error.status = 422;

      debug(error.message);
      next(error);
    }
  },

  delete: async (req, res) => {
    try {
      const expenseId = req.params.expenseId;

      // check if the given id is valid
      if (!ObjectId.isValid(expenseId)) {
        throw createError.Conflict(`Invalid ID ${expenseId}.`);
      }

      const deleted = await Expense.deleteOne({ _id: expenseId });

      if (!deleted || (deleted.n === 0 && deleted.ok === 1)) {
        throw createError.Conflict(
          `Could not find a expense with ID: ${vaultId}.`
        );
      }

      res.status(204).send();
    } catch (error) {
      if (error.isJoi === true) error.status = 422;

      debug(error.message);
      next(error);
    }
  },

  getVaultExpenses: async (req, res) => {
    // check if vault exists
    const vaultId = req.params.vaultId;
    const { from, to } = req.query;
    const userId = req.payload.aud;

    const vaultExists = await Vault.findOne({ _id: vaultId });

    if (!vaultExists) {
      throw createError.Conflict(`Vault with ID ${vault} doensn't exist.`);
    } else {
      //check if user has access to the vault
      const userIsVaultOwner = vaultExists.owner.toString() === userId;
      const vaultIsSharedWithUser = vaultExists.shared
        ? vaultExists.shared.map((el) => el.toString()).includes(userId)
        : false;

      if (!userIsVaultOwner && !vaultIsSharedWithUser)
        throw createError.Unauthorized();

      debug(from, to);

      // if from and to is given return expenses within this time frame if not return the last 31 days
      let expenses;
      const today = new Date();

      //TODO: validate from and  to as valid dates to is toDate 0:0:0 am that means that every expense within the to day is not show. Increase the to date by 1 day

      debug(to.toString());

      const toDate = to
        ? to
            .toString()
            .split("-")
            .map((el, i) => (i !== 1 ? el : parseInt(el) + 1))
        : null;

      if ((from && to) || (from && !to)) {
        expenses = await Expense.find({
          dateCreated: {
            $gte: from,
            $lte: toDate,
          },
        });
      } else {
        const month = today.getMonth() + 1; // jan is = 0 every month is off by 1
        const year = today.getFullYear();

        debug(month, year);

        expenses = await Expense.aggregate([
          {
            $addFields: {
              year: { $year: "$dateCreated" },
              month: { $month: "$dateCreated" },
            },
          },
          { $match: { month: month, year: year } },
        ]);
      }

      res.send(expenses);
    }
  },
};
