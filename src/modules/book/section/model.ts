var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const bookSectionSchema = new Schema(
  {
    title: { type: String },
    description: { type: String },
    reference: { type: String },
    bookref: { type: String },
    themes: { type: Array },
  },
  { timestamps: true, strict: false, strictQuery: false }
);

// bookSchema.index({ content: "text" });

const bookSectionCollection = "book.section";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { bookSectionSchema, bookSectionCollection };
