const { Router } = require("express");
const { authenticate } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const { getAll, getOne, changeRole, changeStatus } = require("./users.controller");

const router = Router();

router.use(authenticate, requireRole("ADMIN"));

router.get("/", getAll);
router.get("/:id", getOne);
router.patch("/:id/role", changeRole);
router.patch("/:id/status", changeStatus);

module.exports = router;