import { bookCollection, bookSchema } from "./model";
const { getCollection } = require("../../lib/dbutils");
import { nextval, resetval } from "../sequence/service";
import * as GoogleBookHelper from "./google_book_helper";
import { isEmptyOrSpaces } from "../../lib/Utils";
import * as Gptutils from "../../lib/gptutils";
import { getBookDetailPrompt } from "./prompt";
import { ChatGpt, Gemini } from "aihub";

const config = require("../../../env");

export const validateBook = async (book: any, userId?: string) => {
  // const gptResponse = await Gemini.process(
  //   config.GEMINI_API_KEY,
  //   "/v1beta/models/gemini-1.5-flash:generateContent",
  //   {
  //     contents: [
  //       {
  //         parts: [{ text: "You are a highly intelligent assistant that processes book details.\n\nWhen given a book name and author name, verify the book's existence.\n\nIf the book is valid, return only a JSON object with 'categories' (as an array), 'description' (a detailed description of 2 to 5 paragraphs), 'shortDescription' (a single paragraph summary), 'fullBookName', 'title', 'pageCount', 'authors' (as an array), 'primaryAuthor', 'publishedDate', 'isbn', 'authorInfo' (a paragraph of information about the author's major works and achievements), and 'chapterCount' (the total number of chapters in the book). If the book is part of a multi-volume series, combine the number of chapters from all volumes in 'chapterCount'. The 'authors' field should be an array ordered by the popularity of the authors. If the book cannot be found, return only a JSON object with 'errorDescription'. The response must be in JSON format only, without any additional text.\n\nPlease find the details for the book 'Anna karenina' authored by 'leo tolstoy'." }],
  //       },
  //     ],
  //   },
  //   "object"
  // );

  const gptResponse = await ChatGpt.process(
    config.CHATGPT_API_KEY,
    "/v1/chat/completions",
    getBookDetailPrompt(book.title, book.primaryAuthor),
    "object"
  );

  return {
    data: gptResponse.isSuccessful
      ? {
          title: gptResponse.responseObject.title,
          fullTitle: gptResponse.responseObject.fullBookName,
          ...gptResponse.responseObject,
        }
      : null,
    outcome: {
      status:
        gptResponse.isSuccessful && !gptResponse.responseObject.errorDescription
          ? "success"
          : "failure",
      errorCode: gptResponse.errorCode,
      errorDetails: gptResponse.errorDetails,
      errorMessage: gptResponse.responseObject.errorDescription,
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

export const updateBook = async (
  space: string,
  bookId: string,
  data: any,
  userId?: string
) => {
  const model = getCollection(space, bookCollection, bookSchema);
  let response = null;
  response = await model.findByIdAndUpdate(bookId, data, {
    new: true,
    upsert: true,
  });

  return response;
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

export const getCoverImages = async (
  space: string,
  reference: string,
  userId?: string
) => {
  const book = await getBookByReference(space, reference);
  return await GoogleBookHelper.getAllBooksByBookNameAndAuthor(
    book.title,
    book.primaryAuthor
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
