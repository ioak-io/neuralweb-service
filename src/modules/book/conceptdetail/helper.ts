const axios = require("axios");
import { cloneDeep, intersection } from "lodash";
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { conceptDetailCollection, conceptDetailSchema } from "./model";
import * as BookHelper from "../helper";
import * as ConceptHelper from "../concept/helper";
import * as ExtractHelper from "../extract/helper";
import * as NoteHelper from "../../note/helper";
import { nextval } from "../../sequence/service";
import * as Gptutils from "../../../lib/gptutils";
import { getBookShortFormPrompt, getConceptSectionPrompt } from "./prompt";
import { bookConceptCollection, bookConceptSchema } from "../concept/model";
const { getCollection } = require("../../../lib/dbutils");

const AI_API = process.env.AI_API || "http://localhost:5003/api";

export const createConceptDetail = async (
  space: string,
  bookref: string,
  conceptref: string,
  payload: {
    type: string;
    sectionTitle?: string;
    sectionDescription?: string;
  },
  userId?: string
) => {
  const book = await BookHelper.getBookByReference(space, bookref);
  const concept = await ConceptHelper.getBookConceptByBookReference(
    space,
    bookref,
    conceptref
  );
  const notes = await NoteHelper.getNoteByBookref(space, bookref);
  const notesList: string[] = [];
  notes.forEach((item: any) => notesList.push(item.content));
  const extracts = await ExtractHelper.getExtractChunksByBookReference(
    space,
    bookref
  );
  extracts.forEach((item: any) => notesList.push(item.text));

  const gptResponseText = await Gptutils.predict(
    getConceptSectionPrompt(
      payload.type,
      book.title,
      book.primaryAuthor,
      concept.name,
      concept.description,
      notesList
    )
  );
  console.log(gptResponseText);
  // const gptResponse = JSON.parse(gptResponseText);

  const model = getCollection(
    space,
    conceptDetailCollection,
    conceptDetailSchema
  );
  // if (payload.type === "THEMES_EXPLORED") {
  //   await ConceptHelper.updateBookConcept(
  //     space,
  //     { _id: concept._id, themes: gptResponse.themes },
  //     userId
  //   );
  // }
  const conceptDetail = await model.create({
    type: payload.type,
    customTitle: payload.sectionTitle,
    customDescription: payload.sectionDescription,
    bookref,
    conceptref,
    content: gptResponseText,
  });
  return conceptDetail;
};

export const updateConceptDetail = async (
  space: string,
  id: string,
  data: any,
  userId?: string
) => {
  const model = getCollection(
    space,
    conceptDetailCollection,
    conceptDetailSchema
  );
  let response = null;
  response = await model.findByIdAndUpdate(id, data, {});
  return response;
};

export const getConceptDetailsByBookReference = async (
  space: string,
  bookref: string,
  conceptref: string
) => {
  const model = getCollection(
    space,
    conceptDetailCollection,
    conceptDetailSchema
  );

  return await model.find({ bookref, conceptref });
};

export const getConceptDetailsByBookReferenceShortform = async (
  space: string,
  bookref: string
) => {
  const model = getCollection(
    space,
    conceptDetailCollection,
    conceptDetailSchema
  );

  return await model.find({ bookref, type: "_shortform" });
};

export const deleteConceptDetail = async (space: string, _id: string) => {
  const model = getCollection(
    space,
    conceptDetailCollection,
    conceptDetailSchema
  );

  await model.deleteMany({ _id });
  return { conceptDetail: _id };
};

export const createShortform = async (
  space: string,
  bookref: string,
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
  const conceptMap: any = {};
  concepts.forEach((item: any) => {
    keyInsightsList.push(item.name);
    conceptMap[item.name] = item.reference;
  });
  const gptResponseText = await Gptutils.predict(
    getBookShortFormPrompt(
      book.title,
      book.primaryAuthor,
      notesList,
      keyInsightsList
    )
  );
  console.log(gptResponseText);
  const gptResponse = JSON.parse(gptResponseText);

  const model = getCollection(
    space,
    conceptDetailCollection,
    conceptDetailSchema
  );

  const conceptModel = getCollection(
    space,
    bookConceptCollection,
    bookConceptSchema
  );

  const keyInsightsDataMap: any = {};
  const keyInsightsSummaryMap: any = {};
  gptResponse.keyInsights?.forEach((item: any) => {
    if (conceptMap[item.title])
      keyInsightsDataMap[conceptMap[item.title]] = item.description;
    keyInsightsSummaryMap[conceptMap[item.title]] = item.summary;
  });

  await BookHelper.updateBook(
    space,
    false,
    { _id: book._id, overview: gptResponse.bookOverview.overview },
    userId
  );

  const bulkOperationsConcept = Object.keys(keyInsightsDataMap).map(
    (item: any) => ({
      updateOne: {
        filter: {
          bookref: book.reference,
          reference: item,
        },
        update: {
          $set: {
            description: keyInsightsSummaryMap[item],
          },
        },
        upsert: true,
      },
    })
  );

  // await conceptModel.bulkWrite(bulkOperationsConcept);

  const bulkOperationsConceptDetail = Object.keys(keyInsightsDataMap).map(
    (item: any) => ({
      updateOne: {
        filter: {
          bookref: book.reference,
          conceptref: item,
          type: "_shortform",
        },
        update: {
          $set: {
            type: "_shortform",
            content: keyInsightsDataMap[item],
          },
        },
        upsert: true,
      },
    })
  );

  await model.bulkWrite(bulkOperationsConceptDetail);
};
