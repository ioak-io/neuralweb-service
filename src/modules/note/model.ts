var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const noteSchema = new Schema(
  {
    name: { type: String },
    folderId: { type: String },
    content: { type: String },
    reference: { type: String },
    labels: {type: Array}
  },
  { timestamps: true, strict: false, strictQuery: false }
);

const noteCollection = "note";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { noteSchema, noteCollection };
