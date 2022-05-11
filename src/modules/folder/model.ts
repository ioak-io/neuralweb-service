var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const folderSchema = new Schema(
  {
    name: { type: String },
    parentId: { type: String },
  },
  { timestamps: true }
);

const folderCollection = "folder";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { folderSchema, folderCollection };
