var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const keywordsSchema = new Schema(
  {
    data: { type: Array },
  },
  { timestamps: true, minimize: false }
);

const keywordsCollection = "keywords";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { keywordsSchema, keywordsCollection };
