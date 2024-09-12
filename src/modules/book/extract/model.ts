var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const extractSchema = new Schema(
  {
    text: { type: String },
    bookref: { type: String },
    chunks: { type: Number },
  },
  { timestamps: true, strict: false, strictQuery: false }
);

// bookSchema.index({ content: "text" });

const extractCollection = "book.extract";

const extractChunkSchema = new Schema(
  {
    summary: { type: String },
    text: { type: String },
    bookref: { type: String },
    conceptref: { type: Array },
    extractId: { type: String },
  },
  { timestamps: true, strict: false, strictQuery: false }
);

// bookSchema.index({ content: "text" });

const extractChunkCollection = "book.extractchunk";

// module.exports = mongoose.model('bookmarks', articleSchema);
export {
  extractSchema,
  extractCollection,
  extractChunkSchema,
  extractChunkCollection,
};
