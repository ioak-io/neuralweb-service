var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const colorfilterSchema = new Schema(
  {
    name: { type: String },
    color: { type: String },
    text: { type: String },
    textList: { type: Array },
    searchPref: { type: Object },
    order: { type: Number }
  },
  { timestamps: true, minimize: false }
);

const colorfilterCollection = "colorfilter";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { colorfilterSchema, colorfilterCollection };
