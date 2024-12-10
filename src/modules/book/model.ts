var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const bookSchema = new Schema(
  {
    title: { type: String },
    fullTitle: { type: String },
    reference: { type: String },
    description: { type: String },
    shortDescription: { type: String },
    overview: { type: String },
    authors: { type: Array },
    primaryAuthor: { type: String },
    authorInfo: { type: String },
    categories: { type: Array },
    isManaged: { type: Boolean },
    isbn: { type: String },
    pageCount: { type: Number },
    chapterCount: { type: Number },
    publishedDate: { type: String },
    publisher: { type: String },
    thumbnail: { type: String },
    readingProgress: { type: String },
    startedReadingOn: {type: Date}
  },
  { timestamps: true, strict: false, strictQuery: false }
);

// bookSchema.index({ content: "text" });

const bookCollection = "book";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { bookSchema, bookCollection };
