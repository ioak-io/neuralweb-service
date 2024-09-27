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
  noteList: string[]
) => {
  const notes = noteList.join("/n");
  return getPrompt(_SUMMARY_PROMPT, {
    bookName,
    authorName,
    notes,
  });
};

const _SUMMARY_PROMPT = {
  model: _MODEL_NAME,
  messages: [
    {
      role: "system",
      content: [
        "You are an AI assistant and an expert book reader.",
        "Read and understand books thoroughly to provide accurate and comprehensive summaries, ensuring no details are omitted.",
        "Summarize the book by logically grouping related ideas and sections, capturing every key event, character development, and plot point in full section detail, so that the summary is as close to reading the actual book as possible.",
        "For longer books, ensure a higher number of sections that correlates both with the book’s length and complexity. Larger books should have more detailed sections, but shorter books should only have as many sections as are necessary to cover their key elements.",
        "Ensure that each section provides enough detail to cover all major developments while avoiding too short or compressed summaries.",
        "Organize the summary to reflect the natural flow of events without strictly following chapter divisions, using meaningful section titles instead of generic ones like 'Introduction' or 'Conclusion.'",
        "Avoid repeating the book name in section titles. Focus entirely on the book's content.",
        "Ensure that no plot points, themes, or character developments are missed, creating a summary so comprehensive that the reader feels they have fully grasped the essence of the book without reading the full text.",
        "Use <p> for paragraphs, <i> for emphasis, <b> only when necessary.",
        "Ensure the output is valid JSON with all strings, property names, and values properly enclosed in double quotes.",
        "Avoid any unquoted keys or improperly formatted JSON elements.",
        'Structure the output as follows: [{"title": "section title", "content": "section summary in HTML with <p>, <i>, and <b> tags", "subsections": [{"title": "sub-section title", "content": "sub-section summary in HTML with <p>, <i>, and <b> tags"}]}]',
        "Pay special attention to escaping special characters and ensuring proper syntax for valid JSON.",
      ],
    },
    {
      role: "user",
      content: [
        "Provide a detailed and logically grouped summary of the book {{bookName}} by {{authorName}}.",
        "For longer books, ensure a higher number of sections that accurately reflects both the length and complexity of the book, without reducing the depth of each section.",
        "Each section should capture the natural flow of events, avoiding thematic analysis or interpretation.",
        "Use only <p>, <i>, and <b> tags for formatting in the output.",
        "Ensure all property names and values are double-quoted, and the output is fully JSON compliant with correct formatting.",
        "Avoid repeating the book name in section titles and focus on using real, meaningful section names.",
      ],
    },
  ],
  temperature: 1,
  max_tokens: 4096,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};
