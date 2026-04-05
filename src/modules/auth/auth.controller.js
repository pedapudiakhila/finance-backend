const { z } = require("zod");
const authService = require("./auth.service");
const { ok, created } = require("../../utils/ApiResponse");
const ApiError = require("../../utils/ApiError");

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerValidator = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Request body is empty"));
  }
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(
      (e) => `${e.path.join(".")}: ${e.message}`
    );
    return next(new ApiError(422, "Validation failed", errors));
  }
  req.body = result.data;
  next();
};

const loginValidator = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Request body is empty"));
  }
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(
      (e) => `${e.path.join(".")}: ${e.message}`
    );
    return next(new ApiError(422, "Validation failed", errors));
  }
  req.body = result.data;
  next();
};

const register = async (req, res, next) => {
  try {
    const user = await authService.register(
      req.body.name,
      req.body.email,
      req.body.password
    );
    created(res, user, "Account created successfully");
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    ok(res, result, "Logged in successfully");
  } catch (err) {
    next(err);
  }
};
const me = async (req, res, next) => {
  try {
    const User = require("../../models/User");
    const user = await User.findById(req.user.id).select("-password -__v");
    if (!user) return next(new ApiError(404, "User not found"));
    ok(res, user);
  } catch (err) {
    next(err);
  }
};
module.exports = { register, login, registerValidator, loginValidator, me };