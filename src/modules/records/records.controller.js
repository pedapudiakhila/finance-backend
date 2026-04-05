const { z } = require("zod");
const recordsService = require("./records.service");
const { ok, created } = require("../../utils/ApiResponse");
const ApiError = require("../../utils/ApiError");

const recordSchema = z.object({
  amount: z.number().positive("Amount must be a positive number"),
  type: z.enum(["INCOME", "EXPENSE"], {
    errorMap: () => ({ message: "Type must be INCOME or EXPENSE" }),
  }),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
});

const updateRecordSchema = z.object({
  amount: z.number().positive("Amount must be a positive number").optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  category: z.string().min(1, "Category is required").optional(),
  date: z.string().optional(),
  notes: z.string().optional(),
});

const recordValidator = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Request body is empty"));
  }
  const result = recordSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(
      (e) => `${e.path.join(".")}: ${e.message}`
    );
    return next(new ApiError(422, "Validation failed", errors));
  }
  req.body = result.data;
  next();
};

const updateRecordValidator = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Request body is empty"));
  }
  const result = updateRecordSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(
      (e) => `${e.path.join(".")}: ${e.message}`
    );
    return next(new ApiError(422, "Validation failed", errors));
  }
  req.body = result.data;
  next();
};

const create = async (req, res, next) => {
  try {
    const record = await recordsService.createRecord(req.user.id, req.body);
    created(res, record, "Financial record created successfully");
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const result = await recordsService.getRecords(req.query);
    ok(res, result, "Records fetched successfully");
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const record = await recordsService.getRecordById(req.params.id);
    ok(res, record);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const record = await recordsService.updateRecord(req.params.id, req.body);
    ok(res, record, "Record updated successfully");
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await recordsService.softDeleteRecord(req.params.id);
    ok(res, result, "Record deleted successfully");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
  recordValidator,
  updateRecordValidator,
};