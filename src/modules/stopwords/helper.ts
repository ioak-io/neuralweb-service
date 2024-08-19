const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { stopwordsCollection, stopwordsSchema } from "./model";
import { BASE_STOPWORDS_EN } from "./stopwords";
const { getCollection } = require("../../lib/dbutils");

export const toggleStopword = async (space: string, payload: any) => {
  const _text = payload.text.toLowerCase();
  const model = getCollection(space, stopwordsCollection, stopwordsSchema);
  let response = null;
  const existingData = await model.find({ text: _text });
  if (existingData.length > 0) {
    response = await model.findOneAndUpdate(
      { text: _text }, { enabled: !existingData[0].enabled },
      { new: true, upsert: true }
    );
  } else {
    response = await model.create({
      text: _text, enabled: true
    });
  }

  return await getStopwords(space);
};

export const getStopwords = async (space: string) => {
  const model = getCollection(space, stopwordsCollection, stopwordsSchema);

  return await model.find().sort({ text: "ascending" });
};

export const deleteStopword = async (space: string, _id: string) => {
  const model = getCollection(space, stopwordsCollection, stopwordsSchema);

  await model.deleteMany({ _id });
  return await getStopwords(space);
};

export const resetStopwords = async (space: string) => {
  const model = getCollection(space, stopwordsCollection, stopwordsSchema);
  const data: any[] = [];
  BASE_STOPWORDS_EN.forEach(text => {
    data.push({
      text, enabled: true
    });
  })

  await model.deleteMany({});
  await model.insertMany(data);

  return await getStopwords(space);

}
