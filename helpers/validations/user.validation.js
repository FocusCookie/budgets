const Joi = require("joi");
const passwordRegex =
  "^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,30})";

const register = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(new RegExp(passwordRegex))
    .required(),
  name: Joi.string().min(3).max(30).required(),
});

const login = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(new RegExp(passwordRegex))
    .required(),
});

const edit = Joi.object({
  email: Joi.string().email().lowercase(),
  password: Joi.string().min(8).max(30).pattern(new RegExp(passwordRegex)),
  name: Joi.string().min(3).max(30),
});

module.exports = { register, login, edit };
