import Joi from "joi";

export const LoginValidation = {
  body: Joi.object({
    phone_number: Joi.number().required(),
    fcm_token: Joi.string().required(),
  }),
};

export const SignupValidation = {
  body: Joi.object({
    phone_number: Joi.number().required(),
    name: Joi.string().required(),
  }),
};
