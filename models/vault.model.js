const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const debug = require("debug")("dev:vaults-schema");

// Storing user ids in owner and shared
const VaultSchema = new Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  shared: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const Vault = mongoose.model("Vault", VaultSchema);

module.exports = Vault;
