const utilsHelper = {};

// middleware for response message
utilsHelper.sendResponse = (res, status, success, data, errors, message) => {
  const response = {};

  if (success) response.success = success;
  if (data) response.data = data;
  if (errors) response.errors = errors;
  if (message) response.message = message;

  return res.status(status).json(response);
};

// middleware for try catch
utilsHelper.catchAsync = (func) => (req, res, next) =>
  func(req, res, next).catch((err) => next(err));

// middleware for error code
class AppError extends Error {
  constructor(statusCode, message, errorType) {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    // all errors using this class are operational errors
    this.isOperational = true;
    // create a stack trace for debugging (error obj, void obj to avoid stack population)
    Error.captureStackTrace(this, this.constructor);
  }
}

utilsHelper.AppError = AppError;

module.exports = utilsHelper;
