import Joi from "joi";

export const userNameValidation = {
  body: Joi.object({
    name:Joi.string(),
    email:Joi.string(),
    password:Joi.string(),
    userName: Joi.string()
      .regex(/^[-]?(?:[A-Za-z]+[-]?)+$/)
  }),
};
