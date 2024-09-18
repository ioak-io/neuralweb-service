var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const bookSubthemeSchema = new Schema(
  {
    name: { type: String },
    description: { type: String },
    reference: { type: String },
    bookref: { type: String },
    conceptref: { type: String },
    themeref: { type: String },
  },
  { timestamps: true, strict: false, strictQuery: false }
);

// bookSchema.index({ content: "text" });

const bookSubthemeCollection = "book.subtheme";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { bookSubthemeSchema, bookSubthemeCollection };
