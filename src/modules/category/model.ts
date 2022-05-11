var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const categorySchema = new Schema(
  {
    name: { type: String },
    kakeibo: { type: String },
    transactionId: { type: String },
  },
  { timestamps: true }
);

const categoryCollection = "category";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { categorySchema, categoryCollection };
