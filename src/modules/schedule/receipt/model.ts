var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const scheduleReceiptSchema = new Schema(
  {
    name: { type: String },
    from: { type: String },
    to: { type: String },
    description: { type: String },
    total: { type: Number },
    recurrence: { type: String },
    daysInWeek: { type: Array },
    daysInMonth: { type: Array },
    monthsInYear: { type: Array },
    items: { type: Array },
  },
  { timestamps: true }
);

const scheduleReceiptCollection = "schedule.receipt";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { scheduleReceiptSchema, scheduleReceiptCollection };
