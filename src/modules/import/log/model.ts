var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const importLogSchema = new Schema(
  {
    transactionId: { type: String },
    transactionDate: { type: Date },
    expenseRecords: { type: Number },
    expenseTotal: { type: Number },
    incomeRecords: { type: Number },
    incomeTotal: { type: Number },
    receiptRecords: { type: Number },
    receiptTotal: { type: Number },
    budgetRecords: { type: Number },
    budgetTotal: { type: Number },
    categoryRecords: { type: Number },
    incomeCategoryRecords: { type: Number },
    tagRecords: { type: Number },
  },
  { timestamps: true }
);

const importLogCollection = "import.log";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { importLogSchema, importLogCollection };
