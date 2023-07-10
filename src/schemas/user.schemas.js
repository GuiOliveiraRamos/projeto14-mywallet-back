import Joi from "joi";

export const schemaSignInUp = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(3).required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
});

export const schemaSignIn = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(3).required(),
});
