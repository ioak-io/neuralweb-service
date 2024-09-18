const axios = require("axios");
import { bookSubthemeCollection, bookSubthemeSchema } from "./model";
import { nextval } from "../../sequence/service";
const { getCollection } = require("../../../lib/dbutils");

const AI_API = process.env.AI_API || "http://localhost:5003/api";
const SIMILARITY_ALGORITHM = "similarity";

export const createBookSubtheme = async (
  space: string,
  { bookSubtheme, meta }: any,
  userId?: string
) => {
  const model = getCollection(
    space,
    bookSubthemeCollection,
    bookSubthemeSchema
  );
  let response = null;
  response = await model.create({
    ...bookSubtheme,
    // reference: await nextval("bookSubthemeId", undefined, space),
  });
  return response;
};

export const updateBookSubtheme = async (
  space: string,
  data: any,
  userId?: string
) => {
  const model = getCollection(
    space,
    bookSubthemeCollection,
    bookSubthemeSchema
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
      // reference: await nextval("bookSubthemeId", undefined, space),
    });
  }

  const bookSubthemeResponse = await model.find({
    reference: response.reference,
  });
  let bookSubtheme = null;
  if (bookSubthemeResponse.length > 0) {
    bookSubtheme = bookSubthemeResponse[0];
  }

  return {
    bookSubtheme,
  };
};

const _ai_populate_for_subtheme = async (
  space: string,
  bookref: string,
  reference: string
) => {
  console.log(bookref, reference);
  try {
    await axios.get(
      `${AI_API}/${SIMILARITY_ALGORITHM}/${space}/populate-subtheme/${bookref}/${reference}`,
      {}
    );
    console.log("populated keywords for " + bookref + ", " + reference);
  } catch (err) {
    console.log(err);
    // console.log("error from vectorizer")
  }
};

export const getBookSubtheme = async (space: string) => {
  const model = getCollection(
    space,
    bookSubthemeCollection,
    bookSubthemeSchema
  );

  const res = await model.find();
  return res;
};

export const getBookSubthemesByBookReference = async (
  space: string,
  bookref: string
) => {
  const model = getCollection(
    space,
    bookSubthemeCollection,
    bookSubthemeSchema
  );

  return await model.find({ bookref });
};

export const getBookSubthemesByThemeReference = async (
  space: string,
  bookref: string,
  conceptref: string,
  themeref: string
) => {
  const model = getCollection(
    space,
    bookSubthemeCollection,
    bookSubthemeSchema
  );

  console.log(bookref, conceptref, themeref);

  return await model.find({ bookref, conceptref, themeref });
};

export const getBookSubthemeByBookReference = async (
  space: string,
  bookref: string,
  conceptref: string,
  subthemeref: string
) => {
  const model = getCollection(
    space,
    bookSubthemeCollection,
    bookSubthemeSchema
  );

  const response = await model.find({
    bookref,
    conceptref,
    reference: subthemeref,
  });
  if (response.length > 0) {
    return response[0];
  }
  return null;
};

export const getBookSubthemeById = async (space: string, _id: string) => {
  const model = getCollection(
    space,
    bookSubthemeCollection,
    bookSubthemeSchema
  );

  const res = await model.find({ _id });
  if (res.length > 0) {
    return res[0];
  }
};

export const deleteBookSubtheme = async (space: string, _id: string) => {
  const model = getCollection(
    space,
    bookSubthemeCollection,
    bookSubthemeSchema
  );

  await model.deleteMany({ _id });
  return { bookSubtheme: _id };
};

export const deleteBookSubthemeByReference = async (
  space: string,
  reference: string
) => {
  const model = getCollection(
    space,
    bookSubthemeCollection,
    bookSubthemeSchema
  );

  await model.deleteMany({ reference });
  return { bookSubtheme: reference };
};

export const addSubthemes = async (
  space: string,
  bookref: string,
  conceptref: string,
  subthemes: any[]
) => {
  const model = getCollection(
    space,
    bookSubthemeCollection,
    bookSubthemeSchema
  );
  const _payload: any[] = [];
  for (let i = 0; i < subthemes.length; i++) {
    _payload.push({
      updateOne: {
        filter: {
          // _id: item._id,
          bookref,
          conceptref,
          title: subthemes[i].title,
        },
        update: {
          ...subthemes[i],
          reference: await nextval("subthemeId", conceptref, space),
        },
        upsert: true,
      },
    });
  }
  return await model.bulkWrite(_payload);
};
