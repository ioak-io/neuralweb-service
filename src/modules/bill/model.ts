var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const billSchema = new Schema(
  {
    number: { type: String },
    description: { type: String },
    billDate: { type: Date },
    total: { type: Number },
    scheduleId: { type: String },
    transactionId: { type: String },
    mode: { type: String },
  },
  { timestamps: true }
);

const billCollection = "bill";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { billSchema, billCollection };
