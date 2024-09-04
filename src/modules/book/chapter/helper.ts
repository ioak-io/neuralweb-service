const axios = require("axios");
import { cloneDeep, intersection } from "lodash";
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { bookChapterCollection, bookChapterSchema } from "./model";
import * as BookHelper from "../helper";
import { nextval } from "../../sequence/service";
import * as Gptutils from "../../../lib/gptutils";
import { getBookChaptersPrompt } from "./prompt";
const { getCollection } = require("../../../lib/dbutils");

const AI_API = process.env.AI_API || "http://localhost:5003/api";

export const generateChapters = async (space: string, bookref: string) => {
  const book = await BookHelper.getBookByReference(space, bookref);
  console.log(book?.isbn);
  if (!book || !book.isManaged) {
    return null;
  }

  const gptResponseText = await Gptutils.predict(
    getBookChaptersPrompt(book.title, book.primaryAuthor)
  );
  console.log(gptResponseText);
  const gptResponse = JSON.parse(gptResponseText);
  console.log(gptResponse);

  if (!gptResponse) {
    return null;
  }

  const model = getCollection(space, bookChapterCollection, bookChapterSchema);
  const _payload: any[] = [];
  for (let i = 0; i < gptResponse.length; i++) {
    _payload.push({
      updateOne: {
        filter: {
          // _id: item._id,
          bookref,
          name: gptResponse[i],
        },
        update: {
          name: gptResponse[i],
          reference: await nextval("chapterId", bookref, space),
        },
        upsert: true,
      },
    });
  }
  return await model.bulkWrite(_payload);
};

export const createBookChapter = async (
  space: string,
  { bookChapter, meta }: any,
  userId?: string
) => {
  const model = getCollection(space, bookChapterCollection, bookChapterSchema);
  let response = null;
  response = await model.create({
    ...bookChapter,
    // reference: await nextval("bookChapterId", undefined, space),
  });
  console.log(response.reference);
  return response;
};

export const updateBookChapter = async (
  space: string,
  data: any,
  userId?: string
) => {
  const model = getCollection(space, bookChapterCollection, bookChapterSchema);
  let response = null;
  if (data._id) {
    response = await model.findByIdAndUpdate(data._id, data, {
      new: true,
      upsert: true,
    });
  } else {
    response = await model.create({
      ...data,
      // reference: await nextval("bookChapterId", undefined, space),
    });
  }

  const bookChapterResponse = await model.find({
    reference: response.reference,
  });
  let bookChapter = null;
  if (bookChapterResponse.length > 0) {
    bookChapter = bookChapterResponse[0];
  }

  return {
    bookChapter,
  };
};

export const getBookChapter = async (space: string) => {
  const model = getCollection(space, bookChapterCollection, bookChapterSchema);

  const res = await model.find();
  return res;
};

export const getBookChaptersByBookReference = async (
  space: string,
  bookref: string
) => {
  const model = getCollection(space, bookChapterCollection, bookChapterSchema);

  return await model.find({ bookref });
};

export const getBookChapterByBookReference = async (
  space: string,
  bookref: string,
  chapterref: string
) => {
  const model = getCollection(space, bookChapterCollection, bookChapterSchema);

  const response = await model.find({ bookref, reference: chapterref });
  if (response.length > 0) {
    return response[0];
  }
  return null;
};

export const getBookChapterById = async (space: string, _id: string) => {
  const model = getCollection(space, bookChapterCollection, bookChapterSchema);

  const res = await model.find({ _id });
  if (res.length > 0) {
    return res[0];
  }
};

export const deleteBookChapter = async (space: string, _id: string) => {
  const model = getCollection(space, bookChapterCollection, bookChapterSchema);

  await model.deleteMany({ _id });
  return { bookChapter: _id };
};

export const deleteBookChapterByReference = async (
  space: string,
  reference: string
) => {
  const model = getCollection(space, bookChapterCollection, bookChapterSchema);

  await model.deleteMany({ reference });
  return { bookChapter: reference };
};

export const addChapters = async (
  space: string,
  bookref: string,
  chapterTitles: string[]
) => {
  const model = getCollection(space, bookChapterCollection, bookChapterSchema);
  const _payload: any[] = [];
  for (let i = 0; i < chapterTitles.length; i++) {
    _payload.push({
      updateOne: {
        filter: {
          // _id: item._id,
          bookref,
          name: chapterTitles[i],
        },
        update: {
          name: chapterTitles[i],
          reference: await nextval("chapterId", bookref, space),
        },
        upsert: true,
      },
    });
  }
  return await model.bulkWrite(_payload);
};
