var mongoose = require('mongoose');

const Schema = mongoose.Schema;
const postFollowerSchema = new Schema(
  {
    postId: { type: String },
    userId: { type: String },
  },
  { timestamps: true }
);

const postFollowerCollection = 'post.follower';

// module.exports = mongoose.model('bookmarks', postSchema);
module.exports = { postFollowerSchema, postFollowerCollection };
