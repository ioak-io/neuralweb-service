const axios = require("axios");
import { cloneDeep, intersection } from "lodash";
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { themeDetailCollection, themeDetailSchema } from "./model";
import * as BookHelper from "../helper";
import * as ThemeHelper from "../theme/helper";
import * as SubThemeHelper from "../subtheme/helper";
import * as ExtractHelper from "../extract/helper";
import * as NoteHelper from "../../note/helper";
import { nextval } from "../../sequence/service";
import * as Gptutils from "../../../lib/gptutils";
import { getSecondarySectionPrompt, getSummarySectionPrompt } from "./prompt";
import { bookThemeCollection, bookThemeSchema } from "../theme/model";
const { getCollection } = require("../../../lib/dbutils");

const AI_API = process.env.AI_API || "http://localhost:5003/api";

export const createThemeDetail = async (
  space: string,
  bookref: string,
  conceptref: string,
  themeref: string,
  payload: {
    type: string;
    sectionTitle?: string;
    sectionDescription?: string;
  },
  userId?: string
) => {
  if (payload.type === "summary") {
    return await _createSummary(space, bookref, conceptref, themeref);
  }

  const book = await BookHelper.getBookByReference(space, bookref);
  const model = getCollection(space, themeDetailCollection, themeDetailSchema);
  const contextList = await model.find({
    bookref,
    conceptref,
    themeref,
    type: "context",
  });

  if (contextList.length === 0) {
    return {};
  }

  const gptResponseText = await Gptutils.predict(
    getSecondarySectionPrompt(
      payload.type,
      book.title,
      book.primaryAuthor,
      contextList[0].content
    )
  );
  const content = _processAiResponse(payload.type, gptResponseText);

  const themeDetail = await model.updateOne(
    {
      bookref,
      conceptref,
      themeref,
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
  return themeDetail;
};

const _createSummary = async (
  space: string,
  bookref: string,
  conceptref: string,
  themeref: string
) => {
  const book = await BookHelper.getBookByReference(space, bookref);
  const theme = await ThemeHelper.getBookThemeByBookReference(
    space,
    bookref,
    conceptref,
    themeref
  );
  const notes = await NoteHelper.getNoteByBookref(space, bookref);
  const notesList: string[] = [];
  _filterAndSortDomainByKeywordOverlap(theme.keywords, notes).forEach(
    (item: any) => notesList.push(item.content)
  );
  const extracts = await ExtractHelper.getExtractChunksByBookReference(
    space,
    bookref
  );
  _filterAndSortDomainByKeywordOverlap(theme.keywords, extracts).forEach(
    (item: any) => notesList.push(item.summary)
  );

  const subThemesList = await SubThemeHelper.getBookSubthemesByThemeReference(
    space,
    bookref,
    conceptref,
    themeref
  );

  const subThemes = _formatThemesForPrompt(subThemesList);

  const gptResponseText = await Gptutils.predict(
    getSummarySectionPrompt(
      book.title,
      book.primaryAuthor,
      theme.title,
      theme.description,
      subThemes,
      notesList
    )
  );
  const content = _processAiResponse("summary", gptResponseText);

  const model = getCollection(space, themeDetailCollection, themeDetailSchema);
  const themeDetail = await model.updateOne(
    {
      bookref,
      conceptref,
      themeref,
      type: "summary",
    },
    {
      $set: {
        content,
      },
    },
    { upsert: true } // This will create a new document if no matching document is found
  );
  const shorterSummary = await _generateShorterSummaryForContext(
    book.title,
    book.primaryAuthor,
    content
  );
  await model.updateOne(
    {
      bookref,
      conceptref,
      themeref,
      type: "context",
    },
    {
      $set: {
        content: shorterSummary,
      },
    },
    { upsert: true } // This will create a new document if no matching document is found
  );

  return themeDetail;
};

const _generateShorterSummaryForContext = async (
  bookName: string,
  authorName: string,
  content: string
) => {
  const gptResponseText = await Gptutils.predict(
    getSecondarySectionPrompt("context", bookName, authorName, content)
  );
  return gptResponseText;
};

const _processAiResponse = (type: string, text: any): string => {
  console.log(text);
  let htmlString = "";
  let data = text;
  switch (type) {
    case "summary":
    case "alternate_takes":
      data = JSON.parse(text);
      break;
    default:
      break;
  }
  switch (type) {
    case "summary":
      htmlString = data.themeExploration;
      data.subThemes?.forEach((subTheme: any) => {
        htmlString += `<h4>${subTheme.title}</h4>${subTheme.exploration}`;
      });
      break;
    case "alternate_takes":
      data.forEach((item: any) => {
        htmlString += `<p><b>${item.reference.author}</b> in <i>${item.reference.book}</i></p>${item.content}`;
      });
      break;
    default:
      htmlString = data;
      break;
  }
  return htmlString;
};

function _formatThemesForPrompt(themes: any[]): string {
  // return themes
  //   .map((theme) => `<strong>${theme.title}:</strong> ${theme.description}`)
  //   .join("<br><br>");
  return themes
    .map((theme) => `<strong>${theme.title}:</strong> ${theme.description}`)
    .join(",");
}

const _filterAndSortDomainByKeywordOverlap = (
  inputKeywords: string[],
  data: any[]
): any[] => {
  return data
    .filter((item) =>
      item.keywords?.some((keyword: any) => inputKeywords?.includes(keyword))
    )
    .sort((a, b) => {
      const overlapA = a.keywords?.filter((keyword: any) =>
        inputKeywords.includes(keyword)
      ).length;
      const overlapB = b.keywords?.filter((keyword: any) =>
        inputKeywords.includes(keyword)
      ).length;
      return overlapB - overlapA;
    });
};

export const updateThemeDetail = async (
  space: string,
  id: string,
  data: any,
  userId?: string
) => {
  const model = getCollection(space, themeDetailCollection, themeDetailSchema);
  let response = null;
  response = await model.findByIdAndUpdate(id, data, {});
  return response;
};

export const getThemeDetailsByBookReference = async (
  space: string,
  bookref: string,
  conceptref: string,
  themeref: string
) => {
  const model = getCollection(space, themeDetailCollection, themeDetailSchema);

  return await model.find({ bookref, conceptref, themeref });
};

export const getThemeDetailsByBookReferenceShortform = async (
  space: string,
  bookref: string
) => {
  const model = getCollection(space, themeDetailCollection, themeDetailSchema);

  return await model.find({ bookref, type: "_shortform" });
};

export const deleteThemeDetail = async (space: string, _id: string) => {
  const model = getCollection(space, themeDetailCollection, themeDetailSchema);

  await model.deleteMany({ _id });
  return { themeDetail: _id };
};
