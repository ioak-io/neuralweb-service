var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const articleCommentFeedbackSchema = new Schema(
  {
    commentId: { type: String },
    type: { type: String },
    userId: { type: String },
  },
  { timestamps: true }
);

const articleCommentFeedbackCollection = "article.comment.feedback";

module.exports = {
  articleCommentFeedbackSchema,
  articleCommentFeedbackCollection,
};
