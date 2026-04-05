const FinancialRecord = require("../../models/FinancialRecord");

const getSummary = async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  const [
    incomeResult,
    expenseResult,
    recentActivity,
    categoryBreakdown,
    monthlyTrend,
    weeklyTrend,
  ] = await Promise.all([

    FinancialRecord.aggregate([
      { $match: { type: "INCOME", isDeleted: false } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),

    FinancialRecord.aggregate([
      { $match: { type: "EXPENSE", isDeleted: false } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),

    FinancialRecord.find({ isDeleted: false })
      .sort({ date: -1 })
      .limit(10)
      .populate("createdBy", "name email")
      .select("-__v -isDeleted"),

    FinancialRecord.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: { category: "$category", type: "$type" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      {
        $project: {
          _id: 0,
          category: "$_id.category",
          type: "$_id.type",
          total: 1,
          count: 1,
        },
      },
    ]),

    FinancialRecord.aggregate([
      {
        $match: {
          isDeleted: false,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          type: "$_id.type",
          total: 1,
          count: 1,
        },
      },
    ]),

    FinancialRecord.aggregate([
      {
        $match: {
          isDeleted: false,
          date: { $gte: fourWeeksAgo },
        },
      },
      {
        $group: {
          _id: {
            week: { $isoWeek: "$date" },
            year: { $isoWeekYear: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } },
      {
        $project: {
          _id: 0,
          week: "$_id.week",
          year: "$_id.year",
          type: "$_id.type",
          total: 1,
          count: 1,
        },
      },
    ]),
  ]);

  const totalIncome = incomeResult[0]?.total || 0;
  const totalExpense = expenseResult[0]?.total || 0;

  return {
    summary: {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
    },
    recentActivity,
    categoryBreakdown,
    monthlyTrend,
    weeklyTrend,
  };
};

module.exports = { getSummary };