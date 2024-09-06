var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const bookConceptSchema = new Schema(
  {
    name: { type: String },
    description: { type: String },
    reference: { type: String },
    bookref: { type: String },
  },
  { timestamps: true, strict: false, strictQuery: false }
);

// bookSchema.index({ content: "text" });

const bookConceptCollection = "book.concept";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { bookConceptSchema, bookConceptCollection };
