const axios = require("axios");
import { cloneDeep, intersection } from "lodash";
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import {
  extractChunkCollection,
  extractChunkSchema,
  extractCollection,
  extractSchema,
} from "./model";
import * as BookHelper from "../helper";
import * as ConceptHelper from "../concept/helper";
import * as NoteHelper from "../../note/helper";
import { nextval } from "../../sequence/service";
import * as Gptutils from "../../../lib/gptutils";
import { getAtomicChunksPrompt } from "./prompt";
const { getCollection } = require("../../../lib/dbutils");

const AI_API = process.env.AI_API || "http://localhost:5003/api";
const SIMILARITY_ALGORITHM = "similarity";

export const createExtract = async (
  space: string,
  bookref: string,
  payload: {
    text: string;
  },
  userId?: string
) => {
  const model = getCollection(space, extractCollection, extractSchema);
  const extract = await model.create({ ...payload, bookref });
  return extract;
};

export const updateExtract = async (
  space: string,
  bookref: string,
  id: string,
  data: any,
  userId?: string
) => {
  const gptResponseText = await Gptutils.predict(
    getAtomicChunksPrompt(data.text)
  );
  console.log(gptResponseText);
  const gptResponse = JSON.parse(gptResponseText);

  console.log(gptResponse);

  const model = getCollection(space, extractCollection, extractSchema);
  const { _id, ...rest } = data;

  const extractChunkModel = getCollection(
    space,
    extractChunkCollection,
    extractChunkSchema
  );
  const _payload: any[] = [];
  for (let i = 0; i < gptResponse.length; i++) {
    _payload.push({
      insertOne: {
        document: {
          bookref,
          conceptref: [],
          extractId: id,
          summary: gptResponse[i].summary,
          text: gptResponse[i].content,
        },
      },
    });
  }

  await extractChunkModel.deleteMany({ extractId: id });
  await extractChunkModel.bulkWrite(_payload);

  await model.findByIdAndUpdate(
    id,
    { ...rest, chunks: _payload.length },
    {
      new: true,
      upsert: true,
    }
  );
  const extractChunks = await extractChunkModel.find({
    bookref,
    extractId: id,
  });
  console.log(extractChunks.length);
  for (let i = 0; i < extractChunks.length; i++) {
    await _ai_populate_for_extract(space, bookref, id, extractChunks[i]._id);
  }
};

const _ai_populate_for_extract = async (
  space: string,
  bookref: string,
  extractId: string,
  extractChunkId: string
) => {
  try {
    await axios.get(
      `${AI_API}/${SIMILARITY_ALGORITHM}/${space}/populate-extractchunk/${bookref}/${extractId}/${extractChunkId}`,
      {}
    );
    console.log("populated keywords for " + bookref + ", " + extractChunkId);
  } catch (err) {
    console.log(err);
  }
};

export const getExtractsByBookReference = async (
  space: string,
  bookref: string
) => {
  const model = getCollection(space, extractCollection, extractSchema);

  return await model.find({ bookref });
};

export const deleteExtract = async (space: string, _id: string) => {
  const model = getCollection(space, extractCollection, extractSchema);

  await model.deleteMany({ _id });
  return { extract: _id };
};


export const getExtractChunksByBookReference = async (
  space: string,
  bookref: string
) => {
  const model = getCollection(space, extractChunkCollection, extractChunkSchema);

  return await model.find({ bookref });
};
