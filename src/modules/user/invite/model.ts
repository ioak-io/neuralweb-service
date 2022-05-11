var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const userInviteSchema = new Schema(
  {
    email: { type: String },
    userId: { type: String },
    companyId: { type: String },
    accepted: { type: Boolean },
  },
  { timestamps: true }
);

const userInviteCollection = "user.permission";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { userInviteSchema, userInviteCollection };
