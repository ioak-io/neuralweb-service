var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const chapterDetailSchema = new Schema(
  {
    customTitle: { type: String },
    customDescription: { type: String },
    type: { type: String },
    chapterref: { type: String },
    bookref: { type: String },
    content: { type: JSON },
  },
  { timestamps: true, strict: false, strictQuery: false }
);

// bookSchema.index({ content: "text" });

const chapterDetailCollection = "book.chapterdetail";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { chapterDetailSchema, chapterDetailCollection };
