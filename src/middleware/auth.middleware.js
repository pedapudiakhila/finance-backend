const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const env = require("../config/env");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new ApiError(401, "Access token is missing or malformed"));
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, env.jwtSecret);

    // verify user still exists and is active
    const user = await User.findById(payload.id).select("-password");
    if (!user) return next(new ApiError(401, "User no longer exists"));
    if (!user.isActive) return next(new ApiError(403, "Your account has been deactivated"));

    req.user = { id: user._id, email: user.email, role: user.role };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new ApiError(401, "Token has expired, please login again"));
    }
    return next(new ApiError(401, "Invalid token"));
  }
};

module.exports = { authenticate };