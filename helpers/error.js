const logger = require("./logger");

class APIError extends Error {
  constructor(code, msg) {
    super();
    this.statusCode = code;
    if (Array.isArray(msg)) {
      this.messages = msg;
    } else {
      this.messages = new Array({ msg });
    }
  }
}

const handleErrors = (err, req, res, next) => {
  // log it
  logger.error(err.stack);
  if (err instanceof APIError) {
    // send it
    let { statusCode, messages } = err;
    res.status(statusCode).json({
      status: "error",
      statusCode,
      messages: messages,
    });
  } else {
    // JWT errors
    let statusCode = 500;
    let message = "Internal Server Error. If you see this, contact developer.";

    if (err.name == "UnauthorizedError") {
      statusCode = 401;
      message = "Invalid JWT.";
    }

    // send 500 everytime otherwise
    res.status(statusCode).json({
      status: "Error",
      statusCode,
      message,
    });
  }

  next();
};

function processValidationErrors(req, res, next) {
  const validationResult = require("express-validator").validationResult;
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new APIError(400, errors.array());
  next();
}

module.exports = {
  APIError,
  handleErrors,
  processValidationErrors,
};
