var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const fleetingnoteTagSchema = new Schema(
  {
    name: { type: String },
    noteRef: { type: String },
  },
  { timestamps: true }
);

const fleetingnoteTagCollection = "fleetingnote.tag";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { fleetingnoteTagSchema, fleetingnoteTagCollection };
