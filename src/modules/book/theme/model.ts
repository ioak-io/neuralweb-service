var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const bookThemeSchema = new Schema(
  {
    name: { type: String },
    description: { type: String },
    reference: { type: String },
    bookref: { type: String },
    conceptref: { type: String },
    subThemes: { type: Array },
  },
  { timestamps: true, strict: false, strictQuery: false }
);

// bookSchema.index({ content: "text" });

const bookThemeCollection = "book.theme";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { bookThemeSchema, bookThemeCollection };
