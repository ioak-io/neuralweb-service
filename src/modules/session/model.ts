var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const sessionSchema = new Schema(
  {
    sessionId: { type: String },
    token: { type: String },
    type: { type: String },
  },
  { timestamps: true }
);

const sessionCollection = "session";

// module.exports = mongoose.model('bookmarks', articleSchema);
export { sessionSchema, sessionCollection };
