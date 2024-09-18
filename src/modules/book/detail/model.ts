var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const detailSchema = new Schema(
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

const detailCollection = "book.detail";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { detailSchema, detailCollection };
