const Joi = require("joi");

const create = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  initials: Joi.string().min(1).max(2).required(),
  category: Joi.string().min(1).required(),
});

const edit = Joi.object({
  name: Joi.string().min(2).max(50),
  initials: Joi.string().min(1).max(2),
  category: Joi.string().min(1),
});

module.exports = { create, edit };
