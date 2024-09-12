import * as Handlebars from "handlebars";
import { cloneDeep } from "lodash";

const _MODEL_NAME_GPT3 = "gpt-3.5-turbo";
const _MODEL_NAME_GPT4 = "gpt-4o";
const _MODEL_NAME_GPT4_MINI = "gpt-4o-mini";
const _MODEL_NAME = process.env.CHATGPT_MODEL_NAME || "gpt-4o-mini";

export const getBookShortFormPrompt = (
  type: string,
  bookName: string,
  authorName: string,
  notesList: string[],
  keyInsightsList: string[]
) => {
  const keyInsights = keyInsightsList.join(", ");
  const notes = notesList.join(", ");
  const prompt = cloneDeep(_SHORTFORM_PROMPT);
  for (let i = 0; i < prompt.messages.length; i++) {
    prompt.messages[i].content = Handlebars.compile(prompt.messages[i].content)(
      {
        bookName,
        authorName,
        notes,
        keyInsights,
      }
    );
  }
  console.log(prompt);
  return prompt;
};

const _SHORTFORM_PROMPT = {
  model: _MODEL_NAME,
  messages: [
    {
      role: "system",
      content:
        'You are an AI assistant tasked with creating a comprehensive analysis of a book in JSON format. The output should be detailed, covering a word count of 2500-3000 words. The structure of the JSON should be as follows: \n\n{\n  "bookOverview": {\n    "overview": "string",\n    "authorInfo": "string"\n  },\n  "keyInsights": [\n    {"title": "string", "description": "html"},\n    {"title": "string", "description": "html"},\n    ...\n  ]\n}.\n\nInstructions:\n\n1. For the "bookOverview":\n- Provide a detailed summary of the book\'s main premise and significance (4-5 sentences).\n- Mention the author\'s background and expertise relevant to the book\'s topic (2-3 sentences).\n\n2. For "keyInsights":\n- Each key insight should have a title and a detailed description.\n- The description must be in HTML format, with each paragraph enclosed within <p> tags. Only <p>, <b>, and <i> tags are allowed.\n- The description should include an in-depth explanation of the insight (4-5 paragraphs), practical examples or applications (2-3 paragraphs), and any relevant statistics or research mentioned in the book.\n\nGuidelines:\n- Ensure that the total word count of the output is between 2500 and 3000 words.\n- Ensure that text is paraphrased to avoid direct quotes from the book.\n- Focus on presenting content in a structured and detailed manner with thorough explanations and examples.',
    },
    {
      role: "assistant",
      content:
        "Ensure that each key insight is elaborated with multiple paragraphs and detailed explanations, with each paragraph enclosed in <p> tags. For each key insight in {{keyInsights}}, provide a comprehensive analysis that includes examples, applications, and supporting evidence to meet the 2500-3000 word range.",
    },
    {
      role: "user",
      content:
        "The book is '{{bookName}}' by {{authorName}}. The key insights are: {{keyInsights}}.",
    },
  ],
  temperature: 1,
  max_tokens: 4096,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};
