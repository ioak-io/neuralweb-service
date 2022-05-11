var mongoose = require('mongoose');

const Schema = mongoose.Schema;
const postSchema = new Schema(
  {
    title: { type: String },
    description: { type: String },
    views: { type: Number, default: 0 },
    isAnswered: { type: Boolean, default: false },
    answeredOn: { type: Date },
    followers: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    helpful: { type: Number, default: 0 },
    notHelpful: { type: Number, default: 0 },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

const postCollection = 'post';

// module.exports = mongoose.model('bookmarks', postSchema);
module.exports = { postSchema, postCollection };
