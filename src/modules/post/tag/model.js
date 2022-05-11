var mongoose = require('mongoose');

const Schema = mongoose.Schema;
const postTagSchema = new Schema(
  {
    name: { type: String },
    postId: { type: String },
  },
  { timestamps: true }
);

const postTagCollection = 'post.tag';

// module.exports = mongoose.model('bookmarks', postSchema);
module.exports = { postTagSchema, postTagCollection };
