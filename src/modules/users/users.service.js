const User = require("../../models/User");
const ApiError = require("../../utils/ApiError");

const getAllUsers = async () => {
  return User.find({}).select("-password -__v").sort({ createdAt: -1 });
};

const getUserById = async (id) => {
  const user = await User.findById(id).select("-password -__v");
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

const updateRole = async (id, role) => {
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "User not found");
  user.role = role;
  await user.save();
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
};

const toggleStatus = async (id, requestingUserId) => {
  if (id === requestingUserId.toString()) {
    throw new ApiError(400, "You cannot deactivate your own account");
  }
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "User not found");
  user.isActive = !user.isActive;
  await user.save();
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    isActive: user.isActive,
    message: `User has been ${user.isActive ? "activated" : "deactivated"}`,
  };
};

module.exports = { getAllUsers, getUserById, updateRole, toggleStatus };