const axios = require("axios");
import { cloneDeep, intersection } from "lodash";
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { sectionDetailCollection, sectionDetailSchema } from "./model";
import * as BookHelper from "../helper";
import * as ConceptHelper from "../concept/helper";
import * as ExtractHelper from "../extract/helper";
import * as SectionHelper from "../section/helper";
import * as NoteHelper from "../../note/helper";
import { nextval } from "../../sequence/service";
import * as Gptutils from "../../../lib/gptutils";
import {
  getSecondarySectionPrompt,
  getShortenContentPrompt,
  getShortenThemesPrompt,
  getSummarySectionPrompt,
} from "./prompt";
import { finishGenerating, startGenerating } from "../log/helper";
const { getCollection } = require("../../../lib/dbutils");

const AI_API = process.env.AI_API || "http://localhost:5003/api";

export const createDetail = async (
  space: string,
  bookref: string,
  sectionref: string,
  payload: {
    type: string;
    sectionTitle?: string;
    sectionDescription?: string;
  },
  userId?: string
) => {
  if (payload.type === "summary") {
    return await _createSummary(space, bookref, sectionref);
  }

  const book = await BookHelper.getBookByReference(space, bookref);
  const model = getCollection(
    space,
    sectionDetailCollection,
    sectionDetailSchema
  );
  const contextList = await model.find({
    bookref,
    sectionref,
    type: "context",
  });
  const themesContextList = await model.find({
    bookref,
    sectionref,
    type: "themes_context",
  });

  if (contextList.length === 0) {
    return {};
  }

  const gptResponseText = await Gptutils.predict(
    getSecondarySectionPrompt(
      payload.type,
      book.title,
      book.primaryAuthor,
      contextList[0].content,
      themesContextList.length > 0 ? themesContextList[0].content : undefined
    )
  );
  const content = _processAiResponse(payload.type, gptResponseText);

  const sectiondetail = await model.updateOne(
    {
      bookref,
      sectionref,
      type: payload.type,
    },
    {
      $set: {
        customTitle: payload.sectionTitle,
        customDescription: payload.sectionDescription,
        content,
      },
    },
    { upsert: true }
  );

  if (payload.type === "themes") {
    const shorterSummary = await _generateShorterThemesSummaryForContext(
      book.title,
      book.primaryAuthor,
      gptResponseText
    );
    await model.updateOne(
      {
        bookref,
        sectionref,
        type: "themes_context",
      },
      {
        $set: {
          content: shorterSummary,
        },
      },
      { upsert: true }
    );
  }

  return sectiondetail;
};

const _createSummary = async (
  space: string,
  bookref: string,
  sectionref: string
) => {
  const book = await BookHelper.getBookByReference(space, bookref);
  const notes = await NoteHelper.getNoteByBookref(space, bookref);
  const notesList: string[] = [];
  notes.forEach((item: any) => notesList.push(item.content));
  const extracts = await ExtractHelper.getExtractChunksByBookReference(
    space,
    bookref
  );
  extracts.forEach((item: any) => notesList.push(item.summary));
  const section = await SectionHelper.getBookSectionByBookReference(
    space,
    bookref,
    sectionref
  );
  if (!section) {
    return null;
  }
  const gptResponseText = await Gptutils.predict(
    getSummarySectionPrompt(
      book.title,
      book.primaryAuthor,
      section.title,
      section.description
    )
  );
  const content = _processAiResponse("summary", gptResponseText);

  const model = getCollection(
    space,
    sectionDetailCollection,
    sectionDetailSchema
  );

  const sectiondetail = await model.updateOne(
    {
      bookref,
      sectionref,
      type: "summary",
    },
    {
      $set: {
        content,
      },
    },
    { upsert: true }
  );

  const shorterSummary = await _generateShorterSummaryForContext(
    book.title,
    book.primaryAuthor,
    gptResponseText
  );
  await model.updateOne(
    {
      bookref,
      sectionref,
      type: "context",
    },
    {
      $set: {
        content: shorterSummary,
      },
    },
    { upsert: true }
  );

  return sectiondetail;
};

const _generateShorterSummaryForContext = async (
  bookName: string,
  authorName: string,
  content: string
) => {
  const gptResponseText = await Gptutils.predict(
    getShortenContentPrompt(bookName, authorName, content)
  );
  return gptResponseText;
};

const _generateShorterThemesSummaryForContext = async (
  bookName: string,
  authorName: string,
  content: string
) => {
  const gptResponseText = await Gptutils.predict(
    getShortenThemesPrompt(bookName, authorName, content)
  );
  return gptResponseText;
};

const _processAiResponse = (type: string, text: any): any => {
  let htmlString: any = "";
  let data = text;
  console.log("****", data);
  switch (type) {
    case "summary":
    case "themes":
    case "alternate_takes":
    case "purpose":
      data = JSON.parse(text);
      break;
    default:
      break;
  }
  switch (type) {
    case "summary":
      data.forEach((section: any) => {
        htmlString += `<b>${section.title}</b>`;
        htmlString += section.content;
      });

      break;
    case "themes":
      data.forEach((section: any) => {
        htmlString += `<b>${section.themeTitle}</b>`;
        htmlString += section.content;
      });

      break;
    case "alternate_takes":
      data.forEach((section: any) => {
        htmlString += `<b>${section.author}</b> in <i>${section.book}</i>`;
        htmlString += section.content;
      });

      break;
    case "purpose":
      data.forEach((section: any) => {
        htmlString += `(<i>${section.section}</i>) <b>${section.purpose}</b>`;
        htmlString += section.analysis;
      });

      break;
    default:
      htmlString = data;
      break;
  }
  return htmlString;
};

export const updateDetail = async (
  space: string,
  id: string,
  data: any,
  userId?: string
) => {
  const model = getCollection(
    space,
    sectionDetailCollection,
    sectionDetailSchema
  );
  let response = null;
  response = await model.findByIdAndUpdate(id, data, {});
  return response;
};

export const getDetailsByBookReference = async (
  space: string,
  bookref: string,
  sectionref: string
) => {
  const model = getCollection(
    space,
    sectionDetailCollection,
    sectionDetailSchema
  );

  return await model.find({
    bookref,
    sectionref,
    type: { $nin: ["context", "themes_context"] },
  });
};

export const getDetailsByBookReferenceShortform = async (
  space: string,
  bookref: string
) => {
  const model = getCollection(
    space,
    sectionDetailCollection,
    sectionDetailSchema
  );

  return await model.find({ bookref, type: "summary" });
};

export const deleteDetail = async (space: string, _id: string) => {
  const model = getCollection(
    space,
    sectionDetailCollection,
    sectionDetailSchema
  );

  await model.deleteMany({ _id });
  return { sectiondetail: _id };
};

export const addSectionDetailPlaceholder = async (
  space: string,
  bookref: string,
  sectionref: string,
  sectiontype: string
) => {
  const model = getCollection(
    space,
    sectionDetailCollection,
    sectionDetailSchema
  );

  const sectiondetail = await model.updateOne(
    {
      bookref,
      sectionref,
      type: sectiontype,
    },
    {
      $set: {
        content: "",
      },
    },
    { upsert: true }
  );
};

export const generateAllSectionSummaries = async (
  space: string,
  bookref: string
) => {
  const sections = await SectionHelper.getBookSectionsByBookReference(
    space,
    bookref
  );
  for (let i = 0; i < sections.length; i++) {
    await startGenerating(space, bookref, sections[i].reference, "summary");
    await addSectionDetailPlaceholder(
      space,
      bookref,
      sections[i].reference,
      "summary"
    );
  }
  for (let i = 0; i < sections.length; i++) {
    await _createSummary(space, bookref, sections[i].reference);
    await finishGenerating(space, bookref, sections[i].reference, "summary");
  }
};
