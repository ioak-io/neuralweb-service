var mongoose = require('mongoose');

const Schema = mongoose.Schema;
const postFeedbackSchema = new Schema(
  {
    postId: { type: String },
    type: { type: String },
    userId: { type: String },
  },
  { timestamps: true }
);

const postFeedbackCollection = 'post.feedback';

module.exports = { postFeedbackSchema, postFeedbackCollection };
