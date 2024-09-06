import * as Handlebars from "handlebars";
import { cloneDeep } from "lodash";

const _MODEL_NAME_GPT3 = "gpt-3.5-turbo";
const _MODEL_NAME_GPT4 = "gpt-4o";
const _MODEL_NAME = _MODEL_NAME_GPT4;

export const getBookConceptsPrompt = (bookName: string, authorName: string) => {
  const prompt = cloneDeep(_BOOK_CONCEPTS_PROMPT);
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

const _BOOK_CONCEPTS_PROMPT = {
  model: _MODEL_NAME,
  messages: [
    {
      role: "system",
      content:
        "You are an AI assistant that generates lists of concepts from books. Your task is to read through a book and extract key concepts covered, ensuring that the output captures as much of the book content as possible in a clear and concise manner. The output should be a JSON array of objects, each containing a title and a short description of the concept. If bookName and authorName are provided, reference them without quoting. Otherwise, do not include specific references to any book or author.",
    },
    {
      role: "user",
      content:
        "Generate a list of concepts covered in the book '{{bookName}}' by '{{authorName}}'. The concepts should cover as much of the content as possible while remaining clear and concise. The output should be in the form of a JSON array of objects, with each object containing a 'title' and a 'description' of the concept.",
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
