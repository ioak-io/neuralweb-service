var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const fleetingnotelinkSchema = new Schema(
  {
    sourceNoteRef: { type: String },
    linkedNoteRef: { type: String },
    count: { type: Number },
  },
  { timestamps: true }
);

const fleetingnotelinkCollection = "fleetingnotelink";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { fleetingnotelinkSchema, fleetingnotelinkCollection };
