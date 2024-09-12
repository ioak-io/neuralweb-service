import * as Handlebars from "handlebars";
import { cloneDeep } from "lodash";

const _MODEL_NAME_GPT3 = "gpt-3.5-turbo";
const _MODEL_NAME_GPT4 = "gpt-4o";
const _MODEL_NAME = process.env.CHATGPT_MODEL_NAME || "gpt-4o-mini";;

export const getFlastCardPrompt = (text: string) => {
  const prompt: any = cloneDeep(_CLEAN_TEXT_PROMPT);
  for (let i = 0; i < prompt.messages.length; i++) {
    prompt.messages[i].content = Handlebars.compile(prompt.messages[i].content)(
      { text }
    );
  }
  console.log(prompt);
  return prompt;
};

export const getCleanTextPrompt = (text: string) => {
  const prompt: any = cloneDeep(_CLEAN_TEXT_PROMPT);
  for (let i = 0; i < prompt.messages.length; i++) {
    prompt.messages[i].content = Handlebars.compile(prompt.messages[i].content)(
      { text }
    );
  }
  console.log(prompt);
  return prompt;
};

const _FLASH_CARD_PROMPT = {
  model: _MODEL_NAME,
  messages: [
    {
      role: "system",
      content:
        "You are an AI assistant that will help with text extraction and creating educational materials. You should clean up and correct text extracted from a scanned copy of a book before generating flashcards. The response must be in JSON format only, without any additional text.",
    },
    {
      role: "user",
      content:
        "I have text content extracted from a scanned copy of a few pages of a book using tesseract.js. The extraction process was not accurate, so please correct and clean the text. After cleaning, generate a set of 25 flashcards to help me learn and understand the concept better. Each flashcard should be concise enough to fit onto a card and formatted as a JSON array of objects with the fields 'front' and 'back'. Here is the text: {{text}}",
    },
  ],
  temperature: 1,
  max_tokens: 4096,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};

const _CLEAN_TEXT_PROMPT = {
  model: _MODEL_NAME,
  messages: [
    {
      role: "system",
      content:
        "You are ChatGPT, an advanced assistant. Your role is to take raw, unstructured text extracted from scanned book pages, correct any errors in the text, and rephrase it into a coherent, structured format suitable for study. After cleaning the text, interpret the subject matter in depth and generate a detailed, well-organized essay. The essay should be written in a series of simple paragraphs, covering the complete subject, without using headings or bullet points. The output should be in HTML format, utilizing only paragraph, bold, and italic tags to emphasize important points, ensuring it is easy to follow for a student.",
    },
    {
      role: "user",
      content: "{{text}}",
    },
  ],
  temperature: 1,
  max_tokens: 4096,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};
