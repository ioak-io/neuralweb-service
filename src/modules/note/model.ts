var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const noteSchema = new Schema(
  {
    name: { type: String },
    summary: { type: String },
    content: { type: String },
    contentText: { type: String },
    reference: { type: String },
    labels: { type: Array },
    primaryLabel: { type: String },
    type: { type: String },
    bookrefList: { type: Array },
  },
  { timestamps: true, strict: false, strictQuery: false }
);

noteSchema.index({ content: "text" });

const noteCollection = "note";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { noteSchema, noteCollection };
