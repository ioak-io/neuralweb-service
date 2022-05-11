var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const articleCommentSchema = new Schema(
  {
    text: { type: String },
    parentId: { type: String },
    rootParentId: { type: String },
    articleId: { type: String },
    helpful: { type: Number, default: 0 },
    notHelpful: { type: Number, default: 0 },
    isAnswer: { type: Boolean, default: false },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

const articleCommentCollection = "article.comment";

// module.exports = mongoose.model('bookmarks', postSchema);
module.exports = { articleCommentSchema, articleCommentCollection };
