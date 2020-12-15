const Joi = require("joi");

const register = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
    .required(),
  name: Joi.string().min(3).max(30).required(),
});

const login = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
    .required(),
});

const edit = Joi.object({
  email: Joi.string().email().lowercase(),
  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
  name: Joi.string().min(3).max(30),
});

module.exports = { register, login, edit };
