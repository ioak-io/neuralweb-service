var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const notelinkSchema = new Schema(
  {
    sourceNoteRef: { type: String },
    linkedNoteRef: { type: String },
  },
  { timestamps: true }
);

const notelinkCollection = "notelink";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { notelinkSchema, notelinkCollection };
