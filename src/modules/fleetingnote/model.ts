var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const fleetingnoteSchema = new Schema(
  {
    content: { type: String },
    reference: { type: String },
    labels: { type: Array },
    primaryLabel: { type: String },
  },
  { timestamps: true, strict: false, strictQuery: false }
);

fleetingnoteSchema.index({ content: 'text' })

const fleetingnoteCollection = "fleetingnote";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { fleetingnoteSchema, fleetingnoteCollection };
