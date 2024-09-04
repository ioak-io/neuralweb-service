var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const conceptDetailSchema = new Schema(
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

const conceptDetailCollection = "book.conceptdetail";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { conceptDetailSchema, conceptDetailCollection };
