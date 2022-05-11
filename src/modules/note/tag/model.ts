var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const noteTagSchema = new Schema(
  {
    name: { type: String },
    noteRef: { type: String },
  },
  { timestamps: true }
);

const noteTagCollection = "note.tag";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { noteTagSchema, noteTagCollection };
