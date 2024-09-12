import * as Handlebars from "handlebars";
import { cloneDeep } from "lodash";

const _MODEL_NAME_GPT3 = "gpt-3.5-turbo";
const _MODEL_NAME_GPT4 = "gpt-4o";
const _MODEL_NAME = process.env.CHATGPT_MODEL_NAME || "gpt-4o-mini";;

export const getBookChaptersPrompt = (bookName: string, authorName: string) => {
  const prompt = cloneDeep(_BOOK_CHAPTERS_PROMPT);
  prompt.messages[prompt.messages.length - 1].content = Handlebars.compile(
    prompt.messages[prompt.messages.length - 1].content
  )({
    bookName,
    authorName,
    modelName: _MODEL_NAME,
  });
  console.log(prompt);
  return prompt;
};

const _BOOK_CHAPTERS_PROMPT = {
  model: _MODEL_NAME,
  messages: [
    {
      role: "system",
      content:
        "You are a helpful assistant designed to retrieve and provide accurate book chapter titles. Your task is to process a given book name and author name to generate a JSON array of chapter titles in string format. Ensure that the titles are returned as accurately as possible. The input will include placeholders for bookName and authorName. Do not include any additional details outside of the chapter titles.",
    },
    {
      role: "user",
      content:
        "Please get the list of chapters for the book titled '{{bookName}}' by '{{authorName}}' and return them as a JSON array of strings.",
    },
  ],

  temperature: 1,
  max_tokens: 4096,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};




// - section 3: explain it to a kid
// - section 4: few questions a kid (with a very fresh perspective and a playful attitude) would ask that adults (with a very serious approach to the subject) would overlook. and possible for the same