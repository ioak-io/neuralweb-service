var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const userSchema = new Schema(
  {
    given_name: { type: String },
    family_name: { type: String },
    name: { type: String },
    nickname: { type: String },
    email: { type: String },
    resolver: { type: String },
  },
  { timestamps: true }
);

const userCollection = "user";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { userSchema, userCollection };
