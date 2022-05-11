var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const filterExpenseSchema = new Schema(
  {
    name: { type: String },
    reserved: { type: Boolean },
    showInSummary: { type: Boolean },
    showInDashboard: { type: Boolean },
    from: { type: String },
    to: { type: String },
    description: { type: String },
    moreThan: { type: Number },
    lessThan: { type: Number },
    days: { type: Number },
    months: { type: Number },
    monthNumber: { type: Number },
    yearNumber: { type: Number },
    categoryIdList: { type: Array },
    tagIdList: { type: Array },
    kakeiboList: { type: Array },
  },
  { timestamps: true }
);

const filterExpenseCollection = "filter.expense";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { filterExpenseSchema, filterExpenseCollection };
