var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const noteSchema = new Schema(
  {
    name: { type: String },
    folderId: { type: String },
    content: { type: String },
    reference: { type: String },
  },
  { timestamps: true }
);

const noteCollection = "note";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { noteSchema, noteCollection };
