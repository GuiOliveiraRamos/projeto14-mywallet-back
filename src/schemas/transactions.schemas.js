import Joi from "joi";

export const schemaTransactions = Joi.object({
  valor: Joi.number().positive().required(),
  descricao: Joi.string().required(),
});
