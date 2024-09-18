import * as Handlebars from "handlebars";
import { cloneDeep } from "lodash";
import { getPrompt } from "../../../lib/gptutils";

const _MODEL_NAME_GPT3 = "gpt-3.5-turbo";
const _MODEL_NAME_GPT4 = "gpt-4o";
const _MODEL_NAME_GPT4_MINI = "gpt-4o-mini";
const _MODEL_NAME = process.env.CHATGPT_MODEL_NAME || "gpt-4o-mini";

export const getBookConceptsPrompt = (bookName: string, authorName: string) => {
  return getPrompt(_BOOK_CONCEPTS_PROMPT, {
    bookName,
    authorName,
    modelName: _MODEL_NAME,
  });
};

const _BOOK_CONCEPTS_PROMPT = {
  model: _MODEL_NAME,
  messages: [
    {
      "role": "system",
      "content": [
        "You are an AI assistant tasked with generating lists of key concepts from books;",
        "Your goal is to extract a broad range of important concepts from the book and provide detailed yet concise descriptions for each;",
        "Each concept description should fit into a single paragraph;",
        "Identify and include key concepts from the book based on its content;",
        "For each key concept, provide a flexible number of themes related to that concept. Include as many themes as are applicable but do not enforce a strict number;",
        "Each theme should be represented as an object with 'title' and 'description' fields;",
        "The 'title' of each theme should be a unique name, and the 'description' should provide context about the theme;",
        "Each theme may have a flexible number of sub-themes. Include as many sub-themes as are applicable, but do not enforce a strict number;",
        "Each sub-theme should be represented as an object with 'title' and 'description' fields;",
        "Ensure that all themes and sub-themes across all key concepts are unique in their meaning and content to avoid redundancy;",
        "Provide the output as a JSON array, where each object represents a key concept and includes 'title', 'description', and a 'themes' field;",
        "The 'themes' field should be an array of objects, each containing 'title' and 'description', and optionally a 'subThemes' field, which is an array of objects with 'title' and 'description'.",
        "Ensure the JSON output is properly formatted with correct quotation and comma placement:",
        "1. Property names and string values must be enclosed in double quotes.",
        "2. No trailing commas are allowed.",
        "3. Each object and array should be correctly nested and closed.",
        "If 'bookName' and 'authorName' are provided, include them in the context, but do not quote them;",
        "Avoid HTML content in the output."
      ]
    },
    {
      "role": "user",
      "content": [
        "Generate a comprehensive list of key concepts covered in the book '{{bookName}}' by '{{authorName}}';",
        "Each key concept should be described in a detailed yet concise paragraph;",
        "For each key concept, provide a flexible number of themes related to that concept. Include as many themes as are applicable, but do not enforce a strict number;",
        "Each theme should be represented as an object with 'title' and 'description' fields;",
        "The 'title' of each theme should be a unique name, and the 'description' should provide context to assist GPT in understanding the theme better;",
        "Each theme may include a flexible number of sub-themes. Include as many sub-themes as are applicable, but do not enforce a strict number;",
        "Each sub-theme should be represented as an object with 'title' and 'description' fields;",
        "Ensure that all themes and sub-themes across all key concepts are unique in their meaning and content to avoid redundancy;",
        "Provide the output as a JSON array, where each object represents a key concept and includes 'title', 'description', and a 'themes' field;",
        "The 'themes' field should be an array of objects, each containing 'title' and 'description', and optionally a 'subThemes' field, which is an array of objects with 'title' and 'description'.",
        "Ensure the JSON output is correctly formatted, with proper use of double quotes and no trailing commas."
      ]
    }
]
,
  temperature: 1,
  max_tokens: 4096,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};

// - section 3: explain it to a kid
// - section 4: few questions a kid (with a very fresh perspective and a playful attitude) would ask that adults (with a very serious approach to the subject) would overlook. and possible for the same
