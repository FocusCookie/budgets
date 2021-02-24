const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Storing user ids in owner and shared
const SellingPointSchema = new Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
    required: true,
    maxlength: 50,
  },
  category: {
    type: String,
    required: true,
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const SellingPoint = mongoose.model("SellingPoint", SellingPointSchema);

module.exports = SellingPoint;
