import Joi from "joi";
import { AddAccountDTO } from "./types";

export const validateAddAccount = (requestData: AddAccountDTO): void => {
  const schema = Joi.object().keys({
    name: Joi.string().required(),
    balance: Joi.number().required().default(0),
  });
  const isValidateResult: Joi.ValidationResult = schema.validate(requestData);
  if (isValidateResult?.error) {
    throw new Error(`${isValidateResult.error?.message}`);
  }
};
