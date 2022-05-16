var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const filterGroupSchema = new Schema(
  {
    criteria: { type: String },
    color: { type: String },
  },
  { timestamps: true }
);

const filterGroupCollection = "filtergroup";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { filterGroupSchema, filterGroupCollection };
