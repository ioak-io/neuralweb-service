var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const companySchema = new Schema(
  {
    name: { type: String },
    description: { type: String },
    reference: { type: Number },
    currency: { type: String },
    numberFormat: { type: String },
  },
  { timestamps: true }
);

const companyCollection = "company";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { companySchema, companyCollection };
