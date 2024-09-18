import * as Handlebars from "handlebars";
import { cloneDeep } from "lodash";
import { getPrompt, replaceVariables } from "../../../lib/gptutils";

const _MODEL_NAME_GPT3 = "gpt-3.5-turbo";
const _MODEL_NAME_GPT4 = "gpt-4o";
const _MODEL_NAME_GPT4_MINI = "gpt-4o-mini";
const _MODEL_NAME = process.env.CHATGPT_MODEL_NAME || "gpt-4o-mini";

export const getSecondarySectionPrompt = (
  type: string,
  bookName: string,
  authorName: string,
  content: string
) => {
  switch (type) {
    case "alternate_takes":
      return getPrompt(_ALTERNATE_TAKES_PROMPT, {
        bookName,
        authorName,
        content,
      });
    case "context":
      return getPrompt(_SHORTEN_CONTENT_PROMPT, {
        bookName,
        authorName,
        content,
      });
    default:
      break;
  }
};

export const getSummarySectionPrompt = (
  bookName: string,
  authorName: string,
  themeTitle: string,
  themeDescription: string,
  subThemes: string,
  noteList: string[]
) => {
  const notes = noteList.join("/n");
  return getPrompt(_SUMMARY_PROMPT, {
    bookName,
    authorName,
    themeTitle,
    themeDescription,
    notes,
    subThemes,
  });
};

const _SUMMARY_PROMPT = {
  model: _MODEL_NAME,
  messages: [
    {
      role: "system",
      content: [
        "You are an AI designed to provide a detailed, logically structured, and informative exploration of a theme from a book.",
        "Ensure that your explanation directly describes the theme without framing it as third-person commentary or narrative.",
        "Format the output as a JSON object with two fields: 'themeExploration' and 'subThemes'.",
        "'themeExploration' is a detailed study of the theme, and 'subThemes' is an array of objects with 'title' and 'exploration'.",
        "When exploring sub-themes, avoid quoting or paraphrasing their titles or descriptions again within the 'exploration'. Ensure that there are no self-references or phrases that explicitly point to the sub-theme or its title.",
        "Analyze how the sub-themes support, challenge, or interact with the main theme.",
        "If no sub-themes are provided by the user, return an empty array for 'subThemes'.",
        "Do not create or infer sub-themes unless they are explicitly provided in the input.",
        "Content should be in HTML format with paragraphs, bold, and italic tags.",
      ],
    },
    {
      role: "user",
      content: [
        "Explore the theme of {{themeTitle}} from the book {{bookName}} by {{authorName}}, formatted in JSON with HTML paragraphs, bold, and italic elements.",
        "{{themeDescription}}",
      ],
    },
    {
      role: "user",
      content: [
        "Use the following notes for contextual understanding only, and only where relevant to the book {{bookName}}, the author {{authorName}}, and theme {{themeTitle}}.",
        "Do not directly use these notes as a source for building your exploration:",
        "{{notes}}",
      ],
    },
    {
      role: "user",
      content: [
        "Here are the relevant sub-themes for context:",
        "{{subThemes}}",
      ],
    },
    {
      role: "assistant",
      content:
        '{"themeExploration":"<p>{{themeDescription}}</p><p>{ThemeDetailedExploration1}</p><p>{ThemeDetailedExploration2}</p>","subThemes":[{"title":"{SubThemeTitle1}","exploration":"<p>{DetailedSubThemeDescription1Paragraph1}</p><p>{DetailedSubThemeDescription1Paragraph2}</p><p>{DetailedSubThemeDescription1Paragraph3}</p>"},{"title":"{SubThemeTitle2}","exploration":"<p>{DetailedSubThemeDescription2Paragraph1}</p><p>{DetailedSubThemeDescription2Paragraph2}</p><p>{DetailedSubThemeDescription2Paragraph3}</p>"},{"title":"{SubThemeTitle3}","exploration":"<p>{DetailedSubThemeDescription3Paragraph1}</p><p>{DetailedSubThemeDescription3Paragraph2}</p><p>{DetailedSubThemeDescription3Paragraph3}</p>"},{"title":"{SubThemeTitle4}","exploration":"<p>{DetailedSubThemeDescription4Paragraph1}</p><p>{DetailedSubThemeDescription4Paragraph2}</p><p>{DetailedSubThemeDescription4Paragraph3}</p>"}]}',
    },
  ],
  temperature: 1,
  max_tokens: 4096,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};

const _SHORTEN_CONTENT_PROMPT = {
  model: _MODEL_NAME,
  messages: [
    {
      role: "system",
      content: [
        "You are an AI designed to provide a concise summary of the detailed exploration of a theme from a specific book.",
        "Your summary should capture the essence of the central theme and its sub-themes, while being brief and clear.",
        "Include references to the book name and author name to provide context for later prompts.",
        "Avoid unnecessary details and focus on the key points.",
        "When in doubt, it is safer to retain content rather than remove it. Ensure that important aspects of the theme and sub-themes are preserved.",
      ],
    },
    {
      role: "user",
      content: [
        "Summarize the following content into a shorter, concise version suitable for further analysis or interpretation. Include references to the book name {{bookName}} and author {{authorName}} in the summary:",
        "{{content}}",
      ],
    },
  ],
  temperature: 1,
  max_tokens: 4096,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};

const _ALTERNATE_TAKES_PROMPT = {
  model: _MODEL_NAME,
  messages: [
    {
      role: "system",
      content: [
        "You are an AI designed to provide alternate takes on specific topics covered in the provided content from the book {{bookName}} by {{authorName}}.",
        "Your task is to generate detailed explanations from other authors' perspectives on how their material relates to or contradicts the specific topics covered in the content.",
        "The output should be a list of JSON objects with two fields: 'reference' and 'content'.",
        "'reference' should be an object with 'book' and 'author' fields, indicating the book name and author name of the alternate perspective.",
        "'content' should be HTML formatted with a few paragraphs explaining deeply how the alternate material relates to or contradicts the specific topics covered.",
      ],
    },
    {
      role: "user",
      content: [
        "Provide alternate takes by other authors on the specific topics covered in the content from the book {{bookName}} by {{authorName}}. For each alternate take, include the following details:",
        "1. Reference as an object with 'book' and 'author' fields for the alternate perspective.",
        "2. HTML formatted content with a few paragraphs explaining how the alternate material relates to or contradicts the specific topics covered.",
        "Here is the content for reference:",
        "{{content}}",
      ],
    },
  ],
  temperature: 1,
  max_tokens: 4096,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};
