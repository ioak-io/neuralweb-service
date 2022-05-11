var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const assetSchema = new Schema(
  {
    name: { type: String },
    section: { type: Array },
    featuredTitle: { type: String },
    featuredSubtitle: { type: String },
    jwtPassword: { type: String },
    productionMode: { type: Boolean, default: false },
    assetId: { type: String },
    hero: { type: Object },
  },
  { timestamps: true }
);

const assetCollection = "asset";

module.exports = { assetSchema, assetCollection };
