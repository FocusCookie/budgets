const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const debug = require("debug")("dev:user-schema");
const debugHashPassword = debug.extend("hash-password");
const debugIsValidPassword = debug.extend("isValidPassword");

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

// .pre is a middleware of mongoose
// before storing a user hash the password
UserSchema.pre("save", async function (next) {
  // to ise this, which is UserSchema, dont use the arrow function
  try {
    // generate a salt to hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);

    this.password = hashedPassword;
  } catch (error) {
    debugHashPassword(error.message);
    next(error);
  }
});

// Extend the UserSchema.methids by isValidPassword
UserSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    debugIsValidPassword(error.message);
    throw error; // middleware handles the errors
  }
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
