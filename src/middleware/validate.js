const ApiError = require("../utils/ApiError");

const validate = (schema) => {
  return (req, res, next) => {
    try {
      if (!req.body || Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Request body is empty"));
      }
      const result = schema.safeParse(req.body);
      if (!result.success) {
        const errors = result.error.issues.map(
          (e) => `${e.path.join(".")}: ${e.message}`
        );
        return next(new ApiError(422, "Validation failed", errors));
      }
      req.body = result.data;
      next();
    } catch (err) {
      return next(new ApiError(500, "Validation error"));
    }
  };
};

module.exports = { validate };