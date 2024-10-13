import * as Handlebars from "handlebars";
import { cloneDeep } from "lodash";
import { getPrompt } from "../../../lib/gptutils";

const _MODEL_NAME_GPT3 = "gpt-3.5-turbo";
const _MODEL_NAME_GPT4 = "gpt-4o";
const _MODEL_NAME_GPT4_MINI = "gpt-4o-mini";
const _MODEL_NAME = process.env.CHATGPT_MODEL_NAME || "gpt-4o-mini";

export const getSummarySectionPrompt = (
  bookName: string,
  authorName: string,
  chapters: string,
  noteList: string[]
) => {
  const notes = noteList.join("/n");
  return getPrompt(_SUMMARY_PROMPT, {
    bookName,
    authorName,
    chapters,
    notes,
  });
};

export const getChaptersListPrompt = (
  bookName: string,
  authorName: string,
  chapterCount: number,
  noteList: string[]
) => {
  const notes = noteList.join("/n");
  return getPrompt(_CHAPTERS_PROMPT, {
    bookName,
    authorName,
    chapterCount,
    notes,
  });
};

const _SUMMARY_PROMPT = {
  model: _MODEL_NAME,
  messages: [
    {
      role: "system",
      content: [
        "You are an AI assistant and expert book reader.",
        "Provide comprehensive chapter-by-chapter summaries, ensuring all major plot points, character developments, and themes are included.",
        "Follow the chapters as given by the user, ensuring logical flow and organization of the book's content.",
        "Ensure the content is distributed naturally across the chapters, fitting all key events and elements of the book appropriately.",
        "Each section should capture the essence of the chapter with a detailed summary of at least one paragraph, covering all important aspects without oversimplifying.",
        "Format using <p>, <i>, and <b> tags only when necessary.",
        'Do not include any explanations, only provide a  RFC8259 compliant JSON response following this format without deviation. [{"title": "section title", "content": "section summary", "subsections": [{"title": "sub-section title", "content": "sub-section summary"}]}].',
      ],
    },
    {
      role: "user",
      content: [
        "Provide a detailed summary of {{bookName}} by {{authorName}}.",
        "Use the list of chapter titles provided in {{chapters}} to organize the book's content logically.",
        "Ensure all key details and content of the book are covered within the chapter summaries, flowing correctly from one chapter to the next as per the book's structure.",
        "Each section must cover key details comprehensively without oversimplification and maintain conciseness, providing at least a paragraph for each chapter.",
      ],
    },
  ],
  temperature: 1,
  max_tokens: 8192,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};

const _CHAPTERS_PROMPT = {
  model: _MODEL_NAME,
  messages: [
    {
      role: "system",
      content: [
        "Use the provided book name {{bookName}}.",
        "Use the author name {{authorName}}.",
        "Use the chapter count {{chapterCount}}.",
        "Generate a list of chapter titles that closely follow the actual structure and flow of the book, wherever possible.",
        "If the original book does not have enough distinct chapters to meet the chapterCount, distribute additional chapters evenly throughout the book’s content, while maintaining logical divisions.",
        "Ensure the number of chapters generated is exactly equal to the chapterCount specified.",
        "If chapters are numbered without titles, create suitable titles based on their content.",
        "Do not include any chapter number prefix in the chapter titles. Do not repeat chapter title in chapter subtitle.",
        'Do not include any explanations, only provide a  RFC8259 compliant JSON response following this format without deviation. [{"title": "chapter title", "subtitle": "a short one line text to give a context of wht the chapter is about"}].',
      ],
    },
    {
      role: "user",
      content: [
        "Book name is {{bookName}}.",
        "Author name is {{authorName}}.",
        "Number of chapters is {{chapterCount}}.",
      ],
    },
  ],
  temperature: 1,
  max_tokens: 4096,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};
