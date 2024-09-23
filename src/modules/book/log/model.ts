var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const bookLogSchema = new Schema(
  {
    sectiontype: { type: String },
    sectionref: { type: String },
    bookref: { type: String },
    isRunning: { type: Boolean },
  },
  { timestamps: true, strict: false, strictQuery: false }
);

// bookSchema.index({ content: "text" });

const bookLogCollection = "book.log";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { bookLogSchema, bookLogCollection };
