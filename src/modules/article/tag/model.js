var mongoose = require('mongoose');

const Schema = mongoose.Schema;
const articleTagSchema = new Schema(
  {
    name: { type: String },
    articleId: { type: String },
  },
  { timestamps: true }
);

const articleTagCollection = 'article.tag';

// module.exports = mongoose.model('bookmarks', articleSchema);
module.exports = { articleTagSchema, articleTagCollection };
