var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const sectionDetailSchema = new Schema(
  {
    customTitle: { type: String },
    customDescription: { type: String },
    type: { type: String },
    conceptref: { type: String },
    bookref: { type: String },
    content: { type: JSON },
  },
  { timestamps: true, strict: false, strictQuery: false }
);

// bookSchema.index({ content: "text" });

const sectionDetailCollection = "book.sectiondetail";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { sectionDetailSchema, sectionDetailCollection };
