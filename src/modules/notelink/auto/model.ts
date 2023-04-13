var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const notelinkAutoSchema = new Schema(
  {
    sourceNoteRef: { type: String },
    linkedNoteRef: { type: String },
    count: { type: Number },
  },
  { timestamps: true }
);

const notelinkAutoCollection = "notelink.auto";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { notelinkAutoSchema, notelinkAutoCollection };
