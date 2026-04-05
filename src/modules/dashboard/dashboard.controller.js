const dashboardService = require("./dashboard.service");
const { ok } = require("../../utils/ApiResponse");

const summary = async (req, res, next) => {
  try {
    ok(res, await dashboardService.getSummary(), "Dashboard summary fetched successfully");
  } catch (err) {
    next(err);
  }
};

module.exports = { summary };