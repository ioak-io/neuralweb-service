var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const themeDetailSchema = new Schema(
  {
    customTitle: { type: String },
    customDescription: { type: String },
    type: { type: String },
    themeref: { type: String },
    bookref: { type: String },
    content: { type: String },
    contentObject: { type: JSON },
  },
  { timestamps: true, strict: false, strictQuery: false }
);

// bookSchema.index({ content: "text" });

const themeDetailCollection = "book.themedetail";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { themeDetailSchema, themeDetailCollection };
