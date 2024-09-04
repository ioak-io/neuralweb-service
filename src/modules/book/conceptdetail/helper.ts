const axios = require("axios");
import { cloneDeep, intersection } from "lodash";
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { conceptDetailCollection, conceptDetailSchema } from "./model";
import * as BookHelper from "../helper";
import * as ConceptHelper from "../concept/helper";
import { nextval } from "../../sequence/service";
import * as Gptutils from "../../../lib/gptutils";
import { getConceptSectionPrompt } from "./prompt";
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

  const gptResponseText = await Gptutils.predict(
    getConceptSectionPrompt(
      payload.type,
      book.title,
      book.primaryAuthor,
      concept.name,
      payload.sectionTitle,
      payload.sectionDescription
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
  reload: string,
  data: any,
  userId?: string
) => {
  const model = getCollection(
    space,
    conceptDetailCollection,
    conceptDetailSchema
  );
  let response = null;
  if (data._id) {
    response = await model.findByIdAndUpdate(data._id, data, {
      new: true,
      upsert: true,
    });
  } else {
    response = await model.create({
      ...data,
      // reference: await nextval("conceptDetailId", undefined, space),
    });
  }

  const conceptDetailResponse = await model.find({
    reference: response.reference,
  });
  let conceptDetail = null;
  if (conceptDetailResponse.length > 0) {
    conceptDetail = conceptDetailResponse[0];
  }

  return {
    conceptDetail,
  };
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

export const deleteConceptDetail = async (space: string, _id: string) => {
  const model = getCollection(
    space,
    conceptDetailCollection,
    conceptDetailSchema
  );

  await model.deleteMany({ _id });
  return { conceptDetail: _id };
};
