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
  noteList: string[]
) => {
  const notes = noteList.join("/n");
  return getPrompt(_SUMMARY_PROMPT, {
    bookName,
    authorName,
    notes,
  });
};

export const getShortenContentPrompt = (
  bookName: string,
  authorName: string,
  content: string
) => {
  return getPrompt(_SHORTEN_CONTENT_PROMPT, {
    bookName,
    authorName,
    content,
  });
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

const _SUMMARY_PROMPT = {
  model: _MODEL_NAME,
  messages: [
    {
      "role": "system",
      "content": [
        "You are an AI assistant and an expert book reader.",
        "Read and understand books thoroughly to provide accurate and comprehensive summaries.",
        "Summarize the book by logically grouping related ideas.",
        "Organize the summary to reflect the progression of the book without strictly following chapter divisions.",
        "Format the summaries using <p>, <i>, and <b> tags for paragraphs, italics, and bold text respectively.",
        "Ensure the output is valid JSON, with properly escaped characters.",
        "Any special characters, such as backslashes (\\), double quotes (\") inside strings, and newline characters, should be properly escaped to maintain JSON validity.",
        "Avoid using characters that require escaping unless necessary, and make sure that backslashes and double quotes are correctly handled in the output.",
        "Structure the output as follows: [{\"title\": \"section title\", \"content\": \"section summary in HTML with <p>, <i>, and <b> tags\", \"subsections\": [{\"title\": \"sub-section title\", \"content\": \"sub-section summary in HTML with <p>, <i>, and <b> tags\"}]}]"
      ]
    },
    {
      "role": "user",
      "content": [
        "Provide a detailed, logically grouped summary of the book {{bookName}} by {{authorName}}.",
        "Use only <p>, <i>, and <b> tags for formatting in the output.",
        "Ensure the output is fully JSON compliant, with all special characters properly escaped to avoid syntax errors."
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
