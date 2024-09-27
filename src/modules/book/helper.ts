const axios = require("axios");
import { cloneDeep, intersection } from "lodash";
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { bookCollection, bookSchema } from "./model";
const { getCollection } = require("../../lib/dbutils");
import { nextval, resetval } from "../sequence/service";
import * as GoogleBookHelper from "./google_book_helper";
import { isEmptyOrSpaces } from "../../lib/Utils";
import * as Gptutils from "../../lib/gptutils";
import * as ConceptHelper from "./concept/helper";
import * as ShortformHelper from "./shortform/helper";
import { getBookDetailPrompt } from "./prompt";

export const validateBook = async (
  space: string,
  book: any,
  userId?: string
) => {
  const gptResponseText = await Gptutils.predict(
    getBookDetailPrompt(book.title, book.primaryAuthor)
  );
  const gptResponse = JSON.parse(gptResponseText);

  if (!gptResponse) {
    return {};
  }

  const { fullBookName, title, errorDescription, ...rest } = gptResponse;

  return {
    data: { title: title, fullTitle: fullBookName, ...rest },
    outcome: {
      status: errorDescription ? "failure" : "success",
      errorMessage: errorDescription,
    },
  };
};

export const validateBookUsingGoogleBookApi = async (
  space: string,
  { book }: any,
  userId?: string
) => {
  const gptResponseText = await Gptutils.predict(
    getBookDetailPrompt(book.title, book.primaryAuthor)
  );
  const response = await GoogleBookHelper.getMostRelevantBookMetadata(
    book.title,
    book.primaryAuthor
  );

  console.log(response);

  if (!response) {
    return {
      outcome: {
        status: "failure",
        message:
          "No book could be found with the details specified. Please provide more accurate details to do the search.",
      },
    };
  }

  // const { fullBookName, authors, errorDescription, chapterTitles } =
  //   gptResponse;

  return {
    outcome: {
      status: "success",
    },
    book: {
      ...response,
    },
    // meta: { errorDescription, chapterTitles },
  };
};

export const createBook = async (
  space: string,
  { book, meta }: any,
  userId?: string
) => {
  if (book.isManaged) {
    const bookMetadata =
      await GoogleBookHelper.getBookMetadataByBookNameAndAuthor(
        book.title,
        book.primaryAuthor
      );
    if (bookMetadata) {
      book.thumbnail = bookMetadata.thumbnail;
      book.publisher = bookMetadata.publisher;
      // book.shortDescription = book.description;
      // book.description = bookMetadata.description;
      book.publishedDate = bookMetadata.publishedDate;
    }
  }
  const model = getCollection(space, bookCollection, bookSchema);
  let response = null;
  response = await model.create({
    ...book,
    reference: await nextval("bookId", undefined, space),
  });

  // const concepts = await ConceptHelper.generateConcepts(
  //   space,
  //   response.reference
  // );

  return response;

  // const chapterResponse = await BookChapterHelper.addChapters(
  //   space,
  //   response.reference,
  //   meta.chapterTitles
  // );

  // return { book: response, chapter: chapterResponse };
};

export const updateBook = async (space: string, data: any, userId?: string) => {
  const model = getCollection(space, bookCollection, bookSchema);
  let response = null;
  if (data._id) {
    response = await model.findByIdAndUpdate(data._id, data, {
      new: true,
      upsert: true,
    });
  } else {
    response = await model.create({
      ...data,
      reference: await nextval("bookId", undefined, space),
    });
  }

  const bookResponse = await model.find({
    reference: response.reference,
  });
  let book = null;
  if (bookResponse.length > 0) {
    book = bookResponse[0];
  }

  return {
    book,
  };
};

export const updateChapterCount = async (
  space: string,
  bookref: string,
  chapterCount: number
) => {
  const model = getCollection(space, bookCollection, bookSchema);
  return await model.findOneAndUpdate(
    { reference: bookref },
    { chapterCount },
    {
      upsert: true,
    }
  );
};

export const getBook = async (space: string) => {
  const model = getCollection(space, bookCollection, bookSchema);

  const res = await model.find();
  return res;
};

export const getLibraries = async (space: string) => {
  const model = getCollection(space, bookCollection, bookSchema);

  return await model.find();
};

export const getBookByReference = async (space: string, reference: string) => {
  const model = getCollection(space, bookCollection, bookSchema);

  const res = await model.find({ reference });
  if (res.length === 0) {
    return null;
  }
  return res[0];
};

export const getBookById = async (space: string, _id: string) => {
  const model = getCollection(space, bookCollection, bookSchema);

  const res = await model.find({ _id });
  if (res.length > 0) {
    return res[0];
  }
};

export const deleteBooksByFolderIdList = async (
  space: string,
  folderIdList: string[]
) => {
  const model = getCollection(space, bookCollection, bookSchema);

  return await model.deleteMany({ folderId: { $in: folderIdList } });
};

export const getLibrariesByFolderIdList = async (
  space: string,
  folderIdList: string[]
) => {
  const model = getCollection(space, bookCollection, bookSchema);

  return await model.find({ folderId: { $in: folderIdList } });
};

export const getLibrariesByReferenceList = async (
  space: string,
  refList: string[]
) => {
  const model = getCollection(space, bookCollection, bookSchema);

  return await model.find({ reference: { $in: refList } });
};

export const deleteBook = async (space: string, _id: string) => {
  const model = getCollection(space, bookCollection, bookSchema);

  await model.deleteMany({ _id });
  return { book: _id };
};

export const deleteBookByReference = async (
  space: string,
  reference: string
) => {
  const model = getCollection(space, bookCollection, bookSchema);

  await model.deleteMany({ reference });
  return { book: reference };
};

export const searchBookByText = async (space: string, text: string) => {
  const model = getCollection(space, bookCollection, bookSchema);

  const res = await model.find({
    $text: { $search: `\"${text}\"`, $caseSensitive: false },
  });
  return res;
};

export const searchBook = async (
  space: string,
  text: string,
  textList: string[],
  searchPref: any
) => {
  const _text = text?.toLowerCase()?.replace(/ +/g, " ");

  const model = getCollection(space, bookCollection, bookSchema);
  const condition = await _getSearchCondition(
    space,
    _text,
    textList,
    searchPref
  );
  // console.log(condition);
  const res = await model.find({ $or: condition }).sort({ createdAt: -1 });
  return res.map((item: any) => {
    return {
      ...item._doc,
      summary: isEmptyOrSpaces(item.summary)
        ? item.autoGeneratedSummary
        : item.summary,
    };
  });
};

const _getSearchCondition = async (
  space: string,
  text: string,
  textList: string[],
  searchPref: any
) => {
  const searchFields: string[] = [];

  if (searchPref) {
    Object.keys(searchPref).forEach((fieldName) => {
      if (searchPref[fieldName]) {
        searchFields.push(fieldName);
      }
    });
  }

  const condition: any[] = [];
  const isValidText = !isEmptyOrSpaces(text);
  if (
    isValidText &&
    (searchFields.length === 0 || searchFields.includes("content"))
  ) {
    // condition.push({
    //   $text: { $search: new RegExp(text, 'i'), $caseSensitive: false },
    // });
    condition.push({
      content: new RegExp(text, "i"),
    });
  }
  if (isValidText && searchFields.includes("name")) {
    condition.push({
      name: new RegExp(text, "i"),
    });
  }
  if (isValidText && searchFields.includes("labels")) {
    condition.push({
      labels: {
        $in: text.split(" "),
      },
    });
  }
  if (
    searchFields.length === 1 &&
    searchFields.includes("labels") &&
    textList.length > 0
  ) {
    condition.push({
      labels: {
        $in: textList,
      },
    });
  }
  if (condition.length === 0) {
    return [{}];
  }
  return condition;
};
