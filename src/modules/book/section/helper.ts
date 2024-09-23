const axios = require("axios");
import { cloneDeep, intersection } from "lodash";
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { bookSectionCollection, bookSectionSchema } from "./model";
import * as BookHelper from "../helper";
import * as ConceptHelper from "../concept/helper";
import * as ExtractHelper from "../extract/helper";
import * as ThemeHelper from "../theme/helper";
import * as NoteHelper from "../../note/helper";
import { nextval } from "../../sequence/service";
import * as Gptutils from "../../../lib/gptutils";
import { getSummarySectionPrompt } from "./prompt";
import { addThemes } from "../theme/helper";
const { getCollection } = require("../../../lib/dbutils");

const AI_API = process.env.AI_API || "http://localhost:5003/api";
const SIMILARITY_ALGORITHM = "similarity";

export const generateSections = async (space: string, bookref: string) => {
  const book = await BookHelper.getBookByReference(space, bookref);
  if (!book || !book.isManaged) {
    return null;
  }

  const sections: any[] = await _createSummary(space, bookref);
  console.log(sections);
  const model = getCollection(space, bookSectionCollection, bookSectionSchema);
  const _payload: any[] = [];
  for (let i = 0; i < sections.length; i++) {
    _payload.push({
      updateOne: {
        filter: {
          // _id: item._id,
          bookref,
          title: sections[i].title,
        },
        update: {
          title: sections[i].title,
          description: sections[i].summary,
          reference: await nextval("sectionId", bookref, space),
        },
        upsert: true,
      },
    });
  }
  await model.deleteMany({ bookref });
  await model.bulkWrite(_payload);

  return sections;
};

const _createSummary = async (space: string, bookref: string) => {
  const book = await BookHelper.getBookByReference(space, bookref);
  const notes = await NoteHelper.getNoteByBookref(space, bookref);
  const notesList: string[] = [];
  notes.forEach((item: any) => notesList.push(item.content));
  const extracts = await ExtractHelper.getExtractChunksByBookReference(
    space,
    bookref
  );
  extracts.forEach((item: any) => notesList.push(item.summary));

  const gptResponseText = await Gptutils.predict(
    getSummarySectionPrompt(book.title, book.primaryAuthor, notesList)
  );
  const gptResponse = JSON.parse(gptResponseText);
  const _data: { title: string; summary: string }[] = [];
  gptResponse.forEach((section: any) => {
    let tempText = `${section.content}`;

    section.subsections?.forEach((subsection: any) => {
      tempText += `<b>${subsection.title}</b>${subsection.content}`;
    });
    _data.push({ title: section.title, summary: tempText });
  });

  return _data;
};

const _processAiResponse = (type: string, text: any): any => {
  let htmlString: any = "";
  let data = text;
  console.log("****", data);
  switch (type) {
    case "summary":
    case "presummary":
      data = JSON.parse(text);
      break;
    default:
      break;
  }
  switch (type) {
    case "presummary":
      const _data: { title: string; summary: string }[] = [];
      data.forEach((section: any) => {
        let tempText = `${section.content}`;

        section.subsections?.forEach((subsection: any) => {
          tempText += `<b>${subsection.title}</b>${subsection.content}`;
        });
        _data.push({ title: section.title, summary: tempText });
      });
      htmlString = _data;

      break;
    case "summary":
      console.log("--", data);
      data.forEach((section: any) => {
        htmlString += `<h4>${section.title}</h4>`;
        htmlString += section.content;
      });

      break;
    default:
      htmlString = data;
      break;
  }
  return htmlString;
};

export const createBookSection = async (
  space: string,
  { bookSection, meta }: any,
  userId?: string
) => {
  const model = getCollection(space, bookSectionCollection, bookSectionSchema);
  let response = null;
  response = await model.create({
    ...bookSection,
    // reference: await nextval("bookSectionId", undefined, space),
  });
  console.log(response.reference);
  return response;
};

export const updateBookSection = async (
  space: string,
  data: any,
  userId?: string
) => {
  const model = getCollection(space, bookSectionCollection, bookSectionSchema);
  let response = null;
  if (data._id) {
    response = await model.findByIdAndUpdate(data._id, data, {
      new: true,
      upsert: true,
    });
  } else {
    response = await model.create({
      ...data,
      // reference: await nextval("bookSectionId", undefined, space),
    });
  }

  const bookSectionResponse = await model.find({
    reference: response.reference,
  });
  let bookSection = null;
  if (bookSectionResponse.length > 0) {
    bookSection = bookSectionResponse[0];
  }

  return {
    bookSection,
  };
};

const _ai_populate_for_section = async (
  space: string,
  bookref: string,
  reference: string
) => {
  console.log(bookref, reference);
  try {
    await axios.get(
      `${AI_API}/${SIMILARITY_ALGORITHM}/${space}/populate-section/${bookref}/${reference}`,
      {}
    );
    console.log("populated keywords for " + bookref + ", " + reference);
  } catch (err) {
    console.log(err);
    // console.log("error from vectorizer")
  }
};

export const getBookSection = async (space: string) => {
  const model = getCollection(space, bookSectionCollection, bookSectionSchema);

  const res = await model.find();
  return res;
};

export const getBookSectionsByBookReference = async (
  space: string,
  bookref: string
) => {
  const model = getCollection(space, bookSectionCollection, bookSectionSchema);

  return await model.find({ bookref });
};

export const getBookSectionByBookReference = async (
  space: string,
  bookref: string,
  sectionref: string
) => {
  const model = getCollection(space, bookSectionCollection, bookSectionSchema);

  const response = await model.find({ bookref, reference: sectionref });
  if (response.length > 0) {
    return response[0];
  }
  return null;
};

export const getBookSectionById = async (space: string, _id: string) => {
  const model = getCollection(space, bookSectionCollection, bookSectionSchema);

  const res = await model.find({ _id });
  if (res.length > 0) {
    return res[0];
  }
};

export const deleteBookSection = async (space: string, _id: string) => {
  const model = getCollection(space, bookSectionCollection, bookSectionSchema);

  await model.deleteMany({ _id });
  return { bookSection: _id };
};

export const deleteBookSectionByReference = async (
  space: string,
  reference: string
) => {
  const model = getCollection(space, bookSectionCollection, bookSectionSchema);

  await model.deleteMany({ reference });
  return { bookSection: reference };
};

export const addSections = async (
  space: string,
  bookref: string,
  sectionTitles: string[]
) => {
  const model = getCollection(space, bookSectionCollection, bookSectionSchema);
  const _payload: any[] = [];
  for (let i = 0; i < sectionTitles.length; i++) {
    _payload.push({
      updateOne: {
        filter: {
          // _id: item._id,
          bookref,
          name: sectionTitles[i],
        },
        update: {
          name: sectionTitles[i],
          reference: await nextval("sectionId", bookref, space),
        },
        upsert: true,
      },
    });
  }
  return await model.bulkWrite(_payload);
};
