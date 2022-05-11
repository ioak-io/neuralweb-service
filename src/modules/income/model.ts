var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const incomeSchema = new Schema(
  {
    description: { type: String },
    category: { type: String },
    tagId: { type: Array },
    billId: { type: String },
    billDate: { type: Date },
    amount: { type: Number },
    scheduleId: { type: String },
    transactionId: { type: String },
    mode: { type: String },
  },
  { timestamps: true }
);

const incomeCollection = "income";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { incomeSchema, incomeCollection };
