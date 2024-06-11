const { validationResult } = require("express-validator");
// https://www.npmjs.com/package/express-validation
const mongoose = require("mongoose");

const { sendResponse } = require("../helpers/utils");

//
const validators = {};

// name, email, pw from login request
validators.validate = (validationArray) => async (req, res, next) => {
  await Promise.all(validationArray.map((validation) => validation.run(req)));
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  // error
  const message = errors
    .array()
    .map((error) => error.msg)
    .join("&");

  return sendResponse(res, 422, false, null, message, "validation error");
};

// param
validators.checkObjectId = (paramId) => {
  if (!mongoose.Types.ObjectId.isValid(paramId)) {
    throw new Error("Invalid ObjectId");
  }
  return true;
};

//
module.exports = validators;
