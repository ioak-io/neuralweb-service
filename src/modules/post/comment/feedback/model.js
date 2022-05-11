var mongoose = require('mongoose');

const Schema = mongoose.Schema;
const postCommentFeedbackSchema = new Schema(
  {
    commentId: { type: String },
    type: { type: String },
    userId: { type: String },
  },
  { timestamps: true }
);

const postCommentFeedbackCollection = 'post.comment.feedback';

module.exports = { postCommentFeedbackSchema, postCommentFeedbackCollection };
