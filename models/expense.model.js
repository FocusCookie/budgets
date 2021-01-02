const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Storing user ids in owner and shared
const ExpenseSchema = new Schema({
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  sum: {
    type: String, // sum will be stored hashed!
    required: true,
  },
  type: {
    type: String,
    enum: ["monthly", "spontaneous"],
    default: "spontaneous",
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  vault: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vault",
    required: true,
  },
  sellingPoint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SellingPoints",
    required: true,
  },
  // comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comments" }],
  // images: [{ type: mongoose.Schema.Types.ObjectId, ref: "Images" }],
});

const Expense = mongoose.model("Expense", ExpenseSchema);

module.exports = Expense;
