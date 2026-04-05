const { Router } = require("express");
const { authenticate } = require("../../middleware/auth.middleware");
const { summary } = require("./dashboard.controller");

const router = Router();

router.get("/", authenticate, summary);

module.exports = router;