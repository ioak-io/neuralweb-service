const axios = require("axios");
import { cloneDeep, intersection } from "lodash";
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { chapterDetailCollection, chapterDetailSchema } from "./model";
import * as BookHelper from "../helper";
import * as ChapterHelper from "../chapter/helper";
import { nextval } from "../../sequence/service";
import * as Gptutils from "../../../lib/gptutils";
import { getChapterSectionPrompt } from "./prompt";
const { getCollection } = require("../../../lib/dbutils");

const AI_API = process.env.AI_API || "http://localhost:5003/api";

export const createChapterDetail = async (
  space: string,
  bookref: string,
  chapterref: string,
  payload: {
    type: string;
    sectionTitle?: string;
    sectionDescription?: string;
  },
  userId?: string
) => {
  const book = await BookHelper.getBookByReference(space, bookref);
  const chapter = await ChapterHelper.getBookChapterByBookReference(
    space,
    bookref,
    chapterref
  );

  const gptResponseText = await Gptutils.predict(
    getChapterSectionPrompt(
      payload.type,
      book.title,
      book.primaryAuthor,
      chapter.name,
      payload.sectionTitle,
      payload.sectionDescription
    )
  );
  console.log(gptResponseText);
  // const gptResponse = JSON.parse(gptResponseText);

  const model = getCollection(
    space,
    chapterDetailCollection,
    chapterDetailSchema
  );
  // if (payload.type === "THEMES_EXPLORED") {
  //   await ChapterHelper.updateBookChapter(
  //     space,
  //     { _id: chapter._id, themes: gptResponse.themes },
  //     userId
  //   );
  // }
  const chapterDetail = await model.create({
    type: payload.type,
    customTitle: payload.sectionTitle,
    customDescription: payload.sectionDescription,
    bookref,
    chapterref,
    content: gptResponseText,
  });
  return chapterDetail;
};

export const updateChapterDetail = async (
  space: string,
  reload: string,
  data: any,
  userId?: string
) => {
  const model = getCollection(
    space,
    chapterDetailCollection,
    chapterDetailSchema
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
      // reference: await nextval("chapterDetailId", undefined, space),
    });
  }

  const chapterDetailResponse = await model.find({
    reference: response.reference,
  });
  let chapterDetail = null;
  if (chapterDetailResponse.length > 0) {
    chapterDetail = chapterDetailResponse[0];
  }

  return {
    chapterDetail,
  };
};

export const getChapterDetailsByBookReference = async (
  space: string,
  bookref: string,
  chapterref: string
) => {
  const model = getCollection(
    space,
    chapterDetailCollection,
    chapterDetailSchema
  );

  return await model.find({ bookref, chapterref });
};

export const deleteChapterDetail = async (space: string, _id: string) => {
  const model = getCollection(
    space,
    chapterDetailCollection,
    chapterDetailSchema
  );

  await model.deleteMany({ _id });
  return { chapterDetail: _id };
};
