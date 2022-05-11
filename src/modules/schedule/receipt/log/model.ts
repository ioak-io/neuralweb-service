var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const scheduleReceiptLogSchema = new Schema(
  {
    scheduleId: { type: String },
    transactionId: { type: String },
    receiptId: { type: String },
    transactionDate: { type: Date },
    lineItems: { type: Number },
    total: { type: Number },
  },
  { timestamps: true }
);

const scheduleReceiptLogCollection = "schedule.receipt.log";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { scheduleReceiptLogSchema, scheduleReceiptLogCollection };
