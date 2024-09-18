const axios = require("axios");
import { cloneDeep, intersection } from "lodash";
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { detailCollection, detailSchema } from "./model";
import * as BookHelper from "../helper";
import * as ConceptHelper from "../concept/helper";
import * as ExtractHelper from "../extract/helper";
import * as ThemeHelper from "../theme/helper";
import * as NoteHelper from "../../note/helper";
import { nextval } from "../../sequence/service";
import * as Gptutils from "../../../lib/gptutils";
import {
  getSecondarySectionPrompt,
  getShortenContentPrompt,
  getSummarySectionPrompt,
} from "./prompt";
const { getCollection } = require("../../../lib/dbutils");

const AI_API = process.env.AI_API || "http://localhost:5003/api";

export const createDetail = async (
  space: string,
  bookref: string,
  payload: {
    type: string;
    sectionTitle?: string;
    sectionDescription?: string;
  },
  userId?: string
) => {
  if (payload.type === "summary") {
    return await _createSummary(space, bookref);
  }

  const book = await BookHelper.getBookByReference(space, bookref);
  const model = getCollection(space, detailCollection, detailSchema);
  const contextList = await model.find({
    bookref,
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

  const detail = await model.updateOne(
    {
      bookref,
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

  return detail;
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
  const content = _processAiResponse("summary", gptResponseText);

  const model = getCollection(space, detailCollection, detailSchema);

  const detail = await model.updateOne(
    {
      bookref,
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
      type: "context",
    },
    {
      $set: {
        content: shorterSummary,
      },
    },
    { upsert: true }
  );

  return detail;
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

function _formatThemesForPrompt(themes: any[]): string {
  return themes
    .map((theme) => `<strong>${theme.title}:</strong> ${theme.description}`)
    .join("<br><br>");
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

const _processAiResponse = (type: string, text: any): string => {
  let htmlString = "";
  let data = text;
  console.log("****", data);
  switch (type) {
    case "summary":
      data = JSON.parse(text);
      break;
    default:
      break;
  }
  switch (type) {
    case "summary":
      data.forEach((section: any) => {
        htmlString += `<h4>${section.title}</h4>`;
        htmlString += `${section.content}`;

        section.subsections?.forEach((subsection: any) => {
          htmlString += `<b>${subsection.title}</b>${subsection.content}`;
        });
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
  const model = getCollection(space, detailCollection, detailSchema);
  let response = null;
  response = await model.findByIdAndUpdate(id, data, {});
  return response;
};

export const getDetailsByBookReference = async (
  space: string,
  bookref: string,
  conceptref: string
) => {
  const model = getCollection(space, detailCollection, detailSchema);

  return await model.find({ bookref, conceptref });
};

export const getDetailsByBookReferenceShortform = async (
  space: string,
  bookref: string
) => {
  const model = getCollection(space, detailCollection, detailSchema);

  return await model.find({ bookref, type: "summary" });
};

export const deleteDetail = async (space: string, _id: string) => {
  const model = getCollection(space, detailCollection, detailSchema);

  await model.deleteMany({ _id });
  return { detail: _id };
};
