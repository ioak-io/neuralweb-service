var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const incomeCategorySchema = new Schema(
  {
    name: { type: String },
    kakeibo: { type: String },
    transactionId: { type: String },
  },
  { timestamps: true }
);

const incomeCategoryCollection = "incomecategory";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { incomeCategorySchema, incomeCategoryCollection };
