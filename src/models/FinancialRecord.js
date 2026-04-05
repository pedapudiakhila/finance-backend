const mongoose = require("mongoose");

const financialRecordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    type: {
      type: String,
      enum: {
        values: ["INCOME", "EXPENSE"],
        message: "Type must be either INCOME or EXPENSE",
      },
      required: [true, "Type is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// index for faster filtering
financialRecordSchema.index({ type: 1, category: 1, date: -1 });
financialRecordSchema.index({ isDeleted: 1 });

module.exports = mongoose.model("FinancialRecord", financialRecordSchema);