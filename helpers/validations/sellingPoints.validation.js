const Joi = require("joi");

const create = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  initials: Joi.string().min(1).max(2).required(),
  category: Joi.string().required(),
});

module.exports = { create };
