var mongoose = require('mongoose');

const Schema = mongoose.Schema;
const articleFeedbackSchema = new Schema(
  {
    articleId: { type: String },
    type: { type: String },
    userId: { type: String },
  },
  { timestamps: true }
);

const articleFeedbackCollection = 'article.feedback';

module.exports = { articleFeedbackSchema, articleFeedbackCollection };
