var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const accountSchema = new Schema(
  {
    name: { type: String },
    type: { type: String },
    opening: { type: Number },
    closing: { type: Number },
  },
  { timestamps: true }
);

const accountCollection = "account";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { accountSchema, accountCollection };
