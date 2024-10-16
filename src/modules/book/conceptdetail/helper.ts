const axios = require("axios");
import { cloneDeep, intersection } from "lodash";
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { conceptDetailCollection, conceptDetailSchema } from "./model";
import * as BookHelper from "../helper";
import * as ConceptHelper from "../concept/helper";
import * as ExtractHelper from "../extract/helper";
import * as ThemeHelper from "../theme/helper";
import * as NoteHelper from "../../note/helper";
import { nextval } from "../../sequence/service";
import * as Gptutils from "../../../lib/gptutils";
import {
  getBookShortFormPrompt,
  getSecondarySectionPrompt,
  getShortenContentPrompt,
  getSummarySectionPrompt,
} from "./prompt";
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
  if (payload.type === "summary") {
    return await _createSummary(space, bookref, conceptref);
  }

  const book = await BookHelper.getBookByReference(space, bookref);
  const model = getCollection(
    space,
    conceptDetailCollection,
    conceptDetailSchema
  );
  const contextList = await model.find({
    bookref,
    conceptref,
    type: "context",
  });

  if (contextList.length === 0) {
    return {};
  }
  const references = await model.find({
    conceptref: { $ne: conceptref },
    bookref,
    type: "further_references",
  });

  const excludedBooks: string = references
    .flatMap((entry: any) =>
      entry.content.map(
        (item: any) =>
          `${item.book.replace(/,/g, " ")} by ${item.author.replace(/,/g, " ")}`
      )
    )
    .join(", ");
  console.log(excludedBooks);

  const gptResponseText = await Gptutils.predict(
    getSecondarySectionPrompt(
      payload.type,
      book.title,
      book.primaryAuthor,
      contextList[0].content,
      excludedBooks
    )
  );
  const content = _processAiResponse(payload.type, gptResponseText);

  const conceptDetail = await model.updateOne(
    {
      bookref,
      conceptref,
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

  return conceptDetail;
};

const _createSummary = async (
  space: string,
  bookref: string,
  conceptref: string
) => {
  const book = await BookHelper.getBookByReference(space, bookref);
  const concept = await ConceptHelper.getBookConceptByBookReference(
    space,
    bookref,
    conceptref
  );
  const notes = await NoteHelper.getNoteByBookref(space, bookref);
  const notesList: string[] = [];
  _filterAndSortDomainByKeywordOverlap(concept.keywords, notes).forEach(
    (item: any) => notesList.push(item.content)
  );
  const extracts = await ExtractHelper.getExtractChunksByBookReference(
    space,
    bookref
  );
  _filterAndSortDomainByKeywordOverlap(concept.keywords, extracts).forEach(
    (item: any) => notesList.push(item.summary)
  );

  const themesList = await ThemeHelper.getBookThemesByConceptReference(
    space,
    bookref,
    conceptref
  );

  const themes = _formatThemesForPrompt(themesList);

  console.log(notesList.length);
  console.log(concept.themes);

  const gptResponseText = await Gptutils.predict(
    getSummarySectionPrompt(
      book.title,
      book.primaryAuthor,
      concept.name,
      concept.description,
      themes,
      notesList
    )
  );
  const content = _processAiResponse("summary", gptResponseText);

  const model = getCollection(
    space,
    conceptDetailCollection,
    conceptDetailSchema
  );

  const conceptDetail = await model.updateOne(
    {
      bookref,
      conceptref,
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
      conceptref,
      type: "context",
    },
    {
      $set: {
        content: shorterSummary,
      },
    },
    { upsert: true }
  );

  return conceptDetail;
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
  console.log(text);
  let htmlString = "";
  let data = text;
  switch (type) {
    case "further_references":
      data = JSON.parse(text);
      break;
    default:
      break;
  }
  switch (type) {
    case "further_references2":
      data.forEach((item: any) => {
        htmlString += `
          <li>
            <strong><em>${item.book}</em></strong> by ${
          item.author
        } explores key themes such as ${item.centralIdeas.join(", ")}. 
            ${item.summary}
          </li>
        `;
      });

      break;
    default:
      htmlString = data;
      break;
  }
  return htmlString;
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

  return await model.find({ bookref, type: "summary" });
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
    book._id,
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
