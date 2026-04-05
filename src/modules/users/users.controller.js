const usersService = require("./users.service");
const { ok } = require("../../utils/ApiResponse");
const ApiError = require("../../utils/ApiError");

const getAll = async (req, res, next) => {
  try {
    const users = await usersService.getAllUsers();
    ok(res, users, "Users fetched successfully");
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    ok(res, user);
  } catch (err) {
    next(err);
  }
};

const changeRole = async (req, res, next) => {
  try {
    if (!req.body.role) {
      return next(new ApiError(400, "Role is required"));
    }
    const validRoles = ["VIEWER", "ANALYST", "ADMIN"];
    if (!validRoles.includes(req.body.role)) {
      return next(
        new ApiError(400, "Invalid role. Must be VIEWER, ANALYST or ADMIN")
      );
    }
    const result = await usersService.updateRole(req.params.id, req.body.role);
    ok(res, result, "User role updated successfully");
  } catch (err) {
    next(err);
  }
};

const changeStatus = async (req, res, next) => {
  try {
    const result = await usersService.toggleStatus(req.params.id, req.user.id);
    ok(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, changeRole, changeStatus };