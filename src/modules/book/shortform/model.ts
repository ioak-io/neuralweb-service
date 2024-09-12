var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const shortformSchema = new Schema(
  {
    customTitle: { type: String },
    customDescription: { type: String },
    type: { type: String },
    bookref: { type: String },
    content: { type: JSON },
  },
  { timestamps: true, strict: false, strictQuery: false }
);

// bookSchema.index({ content: "text" });

const shortformCollection = "book.shortform";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { shortformSchema, shortformCollection };
