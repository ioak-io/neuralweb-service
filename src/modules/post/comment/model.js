var mongoose = require('mongoose');

const Schema = mongoose.Schema;
const postCommentSchema = new Schema(
  {
    text: { type: String },
    parentId: { type: String },
    rootParentId: { type: String },
    postId: { type: String },
    helpful: { type: Number, default: 0 },
    notHelpful: { type: Number, default: 0 },
    isAnswer: { type: Boolean, default: false },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

const postCommentCollection = 'post.comment';

// module.exports = mongoose.model('bookmarks', postSchema);
module.exports = { postCommentSchema, postCommentCollection };
