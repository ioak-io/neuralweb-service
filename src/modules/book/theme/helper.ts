const axios = require("axios");
import { bookThemeCollection, bookThemeSchema } from "./model";
import { nextval } from "../../sequence/service";
import { bookSubthemeCollection, bookSubthemeSchema } from "../subtheme/model";
const { getCollection } = require("../../../lib/dbutils");

const AI_API = process.env.AI_API || "http://localhost:5003/api";
const SIMILARITY_ALGORITHM = "similarity";

export const createBookTheme = async (
  space: string,
  { bookTheme, meta }: any,
  userId?: string
) => {
  const model = getCollection(space, bookThemeCollection, bookThemeSchema);
  let response = null;
  response = await model.create({
    ...bookTheme,
    // reference: await nextval("bookThemeId", undefined, space),
  });
  return response;
};

export const updateBookTheme = async (
  space: string,
  data: any,
  userId?: string
) => {
  const model = getCollection(space, bookThemeCollection, bookThemeSchema);
  let response = null;
  if (data._id) {
    response = await model.findByIdAndUpdate(data._id, data, {
      new: true,
      upsert: true,
    });
  } else {
    response = await model.create({
      ...data,
      // reference: await nextval("bookThemeId", undefined, space),
    });
  }

  const bookThemeResponse = await model.find({
    reference: response.reference,
  });
  let bookTheme = null;
  if (bookThemeResponse.length > 0) {
    bookTheme = bookThemeResponse[0];
  }

  return {
    bookTheme,
  };
};

const _ai_populate_for_theme = async (
  space: string,
  bookref: string,
  reference: string
) => {
  console.log(bookref, reference);
  try {
    await axios.get(
      `${AI_API}/${SIMILARITY_ALGORITHM}/${space}/populate-theme/${bookref}/${reference}`,
      {}
    );
    console.log("populated keywords for " + bookref + ", " + reference);
  } catch (err) {
    console.log(err);
    // console.log("error from vectorizer")
  }
};

export const getBookTheme = async (space: string) => {
  const model = getCollection(space, bookThemeCollection, bookThemeSchema);

  const res = await model.find();
  return res;
};

export const getBookThemesByBookReference = async (
  space: string,
  bookref: string
) => {
  const model = getCollection(space, bookThemeCollection, bookThemeSchema);

  return await model.find({ bookref });
};

export const getBookThemesByConceptReference = async (
  space: string,
  bookref: string,
  conceptref: string
) => {
  const model = getCollection(space, bookThemeCollection, bookThemeSchema);

  return await model.find({ bookref, conceptref });
};

export const getBookThemeByBookReference = async (
  space: string,
  bookref: string,
  conceptref: string,
  themeref: string
) => {
  const model = getCollection(space, bookThemeCollection, bookThemeSchema);

  const response = await model.find({
    bookref,
    conceptref,
    reference: themeref,
  });
  if (response.length > 0) {
    return response[0];
  }
  return null;
};

export const getBookThemeById = async (space: string, _id: string) => {
  const model = getCollection(space, bookThemeCollection, bookThemeSchema);

  const res = await model.find({ _id });
  if (res.length > 0) {
    return res[0];
  }
};

export const deleteBookTheme = async (space: string, _id: string) => {
  const model = getCollection(space, bookThemeCollection, bookThemeSchema);

  await model.deleteMany({ _id });
  return { bookTheme: _id };
};

export const deleteBookThemeByReference = async (
  space: string,
  reference: string
) => {
  const model = getCollection(space, bookThemeCollection, bookThemeSchema);

  await model.deleteMany({ reference });
  return { bookTheme: reference };
};

export const addThemes = async (
  space: string,
  bookref: string,
  conceptref: string,
  themes: any[]
) => {
  const model = getCollection(space, bookThemeCollection, bookThemeSchema);
  const subThemeModel = getCollection(
    space,
    bookSubthemeCollection,
    bookSubthemeSchema
  );
  const _payload: any[] = [];
  const _payloadSubThemes: any[] = [];
  for (let i = 0; i < themes.length; i++) {
    const reference = await nextval("themeId", conceptref, space);
    _payload.push({
      updateOne: {
        filter: {
          // _id: item._id,
          bookref,
          conceptref,
          title: themes[i].title,
        },
        update: {
          ...themes[i],
          reference,
        },
        upsert: true,
      },
    });

    for (let j = 0; j < themes[i].subThemes?.length; j++) {
      _payloadSubThemes.push({
        updateOne: {
          filter: {
            // _id: item._id,
            bookref,
            conceptref,
            themeref: reference,
            title: themes[i].title,
          },
          update: {
            ...themes[i].subThemes[j],
            reference: await nextval(
              "subThemeId",
              `${bookref}_${conceptref}_${reference}`,
              space
            ),
          },
          upsert: true,
        },
      });
    }
  }
  await subThemeModel.bulkWrite(_payloadSubThemes);
  return await model.bulkWrite(_payload);
};
