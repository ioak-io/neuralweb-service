var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const metadataDefinitionSchema = new Schema(
  {
    reference: { type: String },
    name: { type: String },
    group: { type: String },
    type: { type: String },
    linkable: { type: Boolean }
  },
  { timestamps: true }
);

const metadataDefinitionCollection = "metadata.definition";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { metadataDefinitionSchema, metadataDefinitionCollection };
