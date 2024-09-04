var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const bookChapterSchema = new Schema(
  {
    name: { type: String },
    reference: { type: String },
    bookref: { type: String },
  },
  { timestamps: true, strict: false, strictQuery: false }
);

// bookSchema.index({ content: "text" });

const bookChapterCollection = "book.chapter";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { bookChapterSchema, bookChapterCollection };
