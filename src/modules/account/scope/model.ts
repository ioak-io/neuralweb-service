var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const accountScopeSchema = new Schema(
  {
    scope: { type: String },
    from: { type: String },
    to: { type: String },
  },
  { timestamps: true }
);

const accountScopeCollection = "account.scope";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { accountScopeSchema, accountScopeCollection };
