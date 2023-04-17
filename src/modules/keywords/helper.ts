const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { keywordsCollection, keywordsSchema } from "./model";
const { getCollection } = require("../../lib/dbutils");

export const getKeywords = async (space: string) => {
  const model = getCollection(space, keywordsCollection, keywordsSchema);

  const res = await model.find();

  if (res.length > 0) {
    return res[0].data;
  }

  return [];

};
