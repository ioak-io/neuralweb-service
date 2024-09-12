const axios = require("axios");
import { cloneDeep, intersection } from "lodash";
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { shortformCollection, shortformSchema } from "./model";
import * as BookHelper from "../helper";
import * as ConceptHelper from "../concept/helper";
import * as NoteHelper from "../../note/helper";
import { nextval } from "../../sequence/service";
import * as Gptutils from "../../../lib/gptutils";
import { getBookShortFormPrompt } from "./prompt";
const { getCollection } = require("../../../lib/dbutils");

const AI_API = process.env.AI_API || "http://localhost:5003/api";

export const createShortform = async (
  space: string,
  bookref: string,
  payload: {
    type: string;
    sectionTitle?: string;
    sectionDescription?: string;
  },
  userId?: string
) => {
  const book = await BookHelper.getBookByReference(space, bookref);
  const notes = await NoteHelper.getNoteByBookref(space, bookref);
  const notesList: string[] = [];
  notes.forEach((item: any) => notesList.push(item.content));

  const concepts = await ConceptHelper.getBookConceptsByBookReference(
    space,
    bookref
  );

  const keyInsightsList: string[] = [];
  concepts.forEach((item: any) => {
    keyInsightsList.push(item.name);
  });
  const gptResponseText = await Gptutils.predict(
    getBookShortFormPrompt(
      payload?.type,
      book.title,
      book.primaryAuthor,
      notesList,
      keyInsightsList
    )
  );
  console.log(gptResponseText);
  const gptResponse = JSON.parse(gptResponseText);

  const model = getCollection(space, shortformCollection, shortformSchema);
  const shortform = await model.create({
    type: payload.type,
    customTitle: payload.sectionTitle,
    customDescription: payload.sectionDescription,
    bookref,
    content: gptResponse,
  });
  return shortform;
};

export const updateShortform = async (
  space: string,
  reload: string,
  data: any,
  userId?: string
) => {
  const model = getCollection(space, shortformCollection, shortformSchema);
  let response = null;
  if (data._id) {
    response = await model.findByIdAndUpdate(data._id, data, {
      new: true,
      upsert: true,
    });
  } else {
    response = await model.create({
      ...data,
      // reference: await nextval("shortformId", undefined, space),
    });
  }

  const shortformResponse = await model.find({
    reference: response.reference,
  });
  let shortform = null;
  if (shortformResponse.length > 0) {
    shortform = shortformResponse[0];
  }

  return {
    shortform,
  };
};

export const getShortformsByBookReference = async (
  space: string,
  bookref: string
) => {
  const model = getCollection(space, shortformCollection, shortformSchema);

  return await model.find({ bookref });
};

export const deleteShortform = async (space: string, _id: string) => {
  const model = getCollection(space, shortformCollection, shortformSchema);

  await model.deleteMany({ _id });
  return { shortform: _id };
};
