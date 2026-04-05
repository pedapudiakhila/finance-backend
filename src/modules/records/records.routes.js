const { Router } = require("express");
const { authenticate } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const {
  create,
  list,
  getOne,
  update,
  remove,
  recordValidator,
  updateRecordValidator,
} = require("./records.controller");

const router = Router();

router.use(authenticate);

router.get("/", requireRole("ANALYST", "ADMIN"), list);
router.get("/:id", requireRole("ANALYST", "ADMIN"), getOne);
router.post("/", requireRole("ADMIN"), recordValidator, create);
router.patch("/:id", requireRole("ADMIN"), updateRecordValidator, update);
router.delete("/:id", requireRole("ADMIN"), remove);

module.exports = router;