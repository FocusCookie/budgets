const Joi = require("joi");

const create = Joi.object({
  sum: Joi.number().not(0).required(),
  type: Joi.string().valid("monthly", "spontaneous").required(),
  sellingPoint: Joi.string().min(24).required(),
  vault: Joi.string().min(24).required(),
});

const edit = Joi.object({
  sum: Joi.number().not(0),
  type: Joi.string().valid("monthly", "spontaneous"),
  sellingPoint: Joi.string().min(24),
});

module.exports = { create, edit };
