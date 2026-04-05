const FinancialRecord = require("../../models/FinancialRecord");
const ApiError = require("../../utils/ApiError");
const { paginate, paginatedResponse } = require("../../utils/pagination");

const createRecord = async (userId, data) => {
  const record = await FinancialRecord.create({
    ...data,
    date: new Date(data.date),
    createdBy: userId,
  });
  return record;
};

const getRecords = async (query) => {
  const { page, limit, skip } = paginate(query);
  const filter = { isDeleted: false };

  if (query.type) filter.type = query.type;
  if (query.category) filter.category = new RegExp(query.category, "i");
  if (query.search) {
    filter.$or = [
      { category: new RegExp(query.search, "i") },
      { notes: new RegExp(query.search, "i") },
    ];
  }
  if (query.from || query.to) {
    filter.date = {};
    if (query.from) filter.date.$gte = new Date(query.from);
    if (query.to) filter.date.$lte = new Date(query.to);
  }

  const [records, total] = await Promise.all([
    FinancialRecord.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email")
      .select("-__v -isDeleted"),
    FinancialRecord.countDocuments(filter),
  ]);

  return paginatedResponse(records, total, page, limit);
};

const getRecordById = async (id) => {
  const record = await FinancialRecord.findOne({ _id: id, isDeleted: false })
    .populate("createdBy", "name email")
    .select("-__v -isDeleted");
  if (!record) throw new ApiError(404, "Record not found");
  return record;
};

const updateRecord = async (id, data) => {
  const record = await FinancialRecord.findOne({ _id: id, isDeleted: false });
  if (!record) throw new ApiError(404, "Record not found");

  Object.assign(record, data);
  if (data.date) record.date = new Date(data.date);
  await record.save();
  return record;
};

const softDeleteRecord = async (id) => {
  const record = await FinancialRecord.findOne({ _id: id, isDeleted: false });
  if (!record) throw new ApiError(404, "Record not found");

  record.isDeleted = true;
  await record.save();
  return { id: record._id, message: "Record deleted successfully" };
};

module.exports = {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  softDeleteRecord,
};