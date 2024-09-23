import * as Handlebars from "handlebars";
import { cloneDeep } from "lodash";

const _MODEL_NAME_GPT3 = "gpt-3.5-turbo";
const _MODEL_NAME_GPT4 = "gpt-4o";
const _MODEL_NAME = process.env.CHATGPT_MODEL_NAME || "gpt-4o-mini";

export const getBookDetailPrompt = (bookName: string, authorName: string) => {
  const prompt = cloneDeep(_BOOK_DETAIL_PROMPT);
  prompt.messages[prompt.messages.length - 1].content = Handlebars.compile(
    prompt.messages[prompt.messages.length - 1].content
  )({
    bookName,
    authorName,
    modelName: _MODEL_NAME,
  });
  return prompt;
};

const _BOOK_DETAIL_PROMPT = {
  model: _MODEL_NAME,
  messages: [
    {
      role: "system",
      content:
        "You are a highly intelligent assistant that processes book details.",
    },
    {
      role: "system",
      content:
        "When given a book name and author name, verify the book's existence.",
    },
    {
      role: "system",
      content:
        "If the book is valid, return only a JSON object with 'categories' (as an array), 'description' (a detailed description of 2 to 5 paragraphs), 'shortDescription' (a single paragraph summary), 'fullBookName', 'title', 'pageCount', 'authors' (as an array), 'primaryAuthor', 'publishedDate', 'isbn', 'authorInfo' (a paragraph of information about the author's major works and achievements), and 'chapterCount' (the total number of chapters in the book). If the book is part of a multi-volume series, combine the number of chapters from all volumes in 'chapterCount'. The 'authors' field should be an array ordered by the popularity of the authors. If the book cannot be found, return only a JSON object with 'errorDescription'. The response must be in JSON format only, without any additional text.",
    },
    {
      role: "user",
      content:
        "Please find the details for the book '{{bookName}}' authored by '{{authorName}}'.",
    },
  ],
  temperature: 1,
  max_tokens: 4096,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};
