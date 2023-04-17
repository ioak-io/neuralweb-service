var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const stopwordsSchema = new Schema(
  {
    text: { type: String },
    enabled: { type: Boolean }
  },
  { timestamps: true, minimize: false }
);

const stopwordsCollection = "stopwords";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { stopwordsSchema, stopwordsCollection };
