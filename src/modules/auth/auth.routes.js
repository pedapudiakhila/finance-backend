const { Router } = require("express");
const {
  register,
  login,
  registerValidator,
  loginValidator,
  me,
} = require("./auth.controller");
const { authenticate } = require("../../middleware/auth.middleware");

const router = Router();

router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);
router.get("/me", authenticate, me);

module.exports = router;