import * as Handlebars from "handlebars";
import { cloneDeep } from "lodash";

const _MODEL_NAME_GPT3 = "gpt-3.5-turbo";
const _MODEL_NAME_GPT4 = "gpt-4o";
const _MODEL_NAME = _MODEL_NAME_GPT4;

const _CONCEPT_SECTION_DEFINITIONS: {
  [key: string]: { sectionTitle: string; sectionDescription: string };
} = {
  overview: {
    sectionTitle: "Overview",
    sectionDescription:
      "Provide a broad overview of the chapter's content, highlighting the main points and structure.",
  },
  summary: {
    sectionTitle: "Summary",
    sectionDescription:
      "Summarize the chapter, capturing the essential elements and key takeaways.",
  },
  themes_explored: {
    sectionTitle: "Themes Explored",
    sectionDescription:
      "Analyze each theme in the chapter by detailing its significance, development, impact on the narrative, and relevant examples or quotes from the text. Each theme should be presented without any numerical or textual prefixes, such as 'Theme 1:' or similar.",
  },
  alternate_perspectives: {
    sectionTitle: "Alternate Perspectives by Other Authors",
    sectionDescription:
      "Explore how different authors or authorities have interpreted the chapter’s content. Discuss varying viewpoints and alternative analyses that provide different perspectives on the same topic. Include the names of the authors and the titles of the books or sources from which these interpretations are derived.",
  },
  critical_analysis: {
    sectionTitle: "Critical Analysis",
    sectionDescription:
      "Provide a detailed critique of the chapter, examining its strengths and weaknesses. Analyze the arguments, evidence, and overall effectiveness of the chapter's presentation and reasoning.",
  },
  explain_to_a_child: {
    sectionTitle: "Explain to a Child",
    sectionDescription:
      "Break down the chapter’s content into simple terms that a child can understand. Use straightforward language and examples to make the key ideas accessible to a younger audience.",
  },
};

export const getConceptSectionPrompt = (
  type: string,
  bookName: string,
  authorName: string,
  keyConceptTitle: string,
  keyConceptDescription: string,
  noteList: string[]
) => {
  const notes = noteList.join(" ");
  switch (type) {
    case "summary":
      return _getPrompt(
        _SUMMARY_PROMPT,
        bookName,
        authorName,
        keyConceptTitle,
        keyConceptDescription,
        notes
      );
    case "themes":
      return _getPrompt(
        _THEMES_PROMPT,
        bookName,
        authorName,
        keyConceptTitle,
        keyConceptDescription,
        notes
      );
    case "alternate_takes":
      return _getPrompt(
        _ALTERNATE_TAKES_PROMPT,
        bookName,
        authorName,
        keyConceptTitle,
        keyConceptDescription,
        notes
      );
    case "further_references":
      return _getPrompt(
        _FURTHER_REFERENCES_PROMPT,
        bookName,
        authorName,
        keyConceptTitle,
        keyConceptDescription,
        notes
      );
    case "mini_essay":
      return _getPrompt(
        _MINI_ESSAY_PROMPT,
        bookName,
        authorName,
        keyConceptTitle,
        keyConceptDescription,
        notes
      );
    case "explain_to_child":
      return _getPrompt(
        _EXPLAIN_TO_CHILD_PROMPT,
        bookName,
        authorName,
        keyConceptTitle,
        keyConceptDescription,
        notes
      );

    default:
      break;
  }
};

const _getPrompt = (
  _prompt: any,
  bookName: string,
  authorName: string,
  keyConceptTitle: string,
  keyConceptDescription: string,
  notes: string
) => {
  const prompt = cloneDeep(_prompt);
  for (let i = 0; i < prompt.messages.length; i++) {
    prompt.messages[i].content = Handlebars.compile(prompt.messages[i].content)(
      {
        bookName,
        authorName,
        keyConceptTitle,
        keyConceptDescription,
        notes,
      }
    );
  }
  console.log(prompt);
  return prompt;
};

/*
System Message 1 (Subject Matter): Directs the model to focus on generating a detailed breakdown or interpretation. This covers various types of content, including overviews, summaries, analyses, and philosophical interpretations.

System Message 2 (Output Structure and Format): Provides technical details on how the content should be formatted and encoded, ensuring consistent output across different types of interpretations.

User Prompt: The placeholders {{sectionTitle}} and {{sectionDescription}} are flexible. For example:

Overview: Set {{sectionTitle}} to "Overview" and provide a description that outlines the chapter's key points.
Summary: Set {{sectionTitle}} to "Summary" and describe the need to condense the chapter’s content.
Chapter Analysis: Use "Themes Explored," "Key Arguments," etc., with descriptions focusing on deep analysis.
Philosophical Analysis: Set {{sectionTitle}} to something like "Philosophical Analysis" and provide a description that guides the model on how to approach the philosophical aspects.
*/

const _CONCEPT_SECTION_PROMPT = {
  model: _MODEL_NAME,
  messages: [
    {
      role: "system",
      content:
        "You are an expert in book analysis. Your task is to generate a detailed breakdown of a book chapter based on the provided parameters. Focus on writing a thorough analysis or interpretation for the section specified.",
    },
    {
      role: "system",
      content:
        "The output should be pure HTML content. It should consist of a series of paragraphs related to the 'sectionTitle' provided, based on the guidelines described in 'sectionDescription'. The content should be returned as a plain HTML string without any JSON or other outer structuring. Ensure that all special characters, including newlines and control characters, are properly escaped.",
    },
    {
      role: "system",
      content:
        "When crafting your response, avoid reminders of the user's instructions. Refrain from apologizing or self-referencing. Focus on providing an informative and structured summary, along with thoughtfully chosen book recommendations.",
    },
    {
      role: "user",
      content:
        "Using the book named '{{bookName}}' by '{{authorName}}', write a {{sectionTitle}} for the chapter titled '{{chapterTitle}}'. The content should be based on the following description: '{{sectionDescription}}'.",
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
      role: "system",
      content:
        "You are an AI designed to provide a detailed, logically structured, and informative summary of a key concept explored in a book. Ensure the summary is informative and specific, covering the main ideas and arguments about the key concept. Use clear, concise language to convey the information, maintaining a logical flow and coherence with smooth transitions between paragraphs. Format the output using HTML with paragraphs, lists, bold, and italic elements. Avoid including any extraneous tags or text. Do not include reminders of the user's instructions or make any self-references or apologies.",
    },
    {
      role: "user",
      content:
        "Summarize {{keyConceptTitle}} from {{bookName}} by {{authorName}}. Include the main ideas and arguments about {{keyConceptTitle}}, formatted in HTML with paragraphs, lists, bold, and italic elements. {{keyConceptDescription}}",
    },
    {
      role: "user",
      content: "Use the following notes to supplement your summary: {{notes}}",
    },
    {
      role: "assistant",
      content:
        "<p><strong>{{keyConceptTitle}}</strong> covers...</p>\n<p>{{keyConceptDescription}}</p>\n<p>The key points are as follows:</p>\n<ul>\n    <li>Description of the first key point, incorporating relevant information from the user's notes if applicable.</li>\n    <li>Description of the second key point, using both book knowledge and notes.</li>\n    <li>Description of the third key point, integrating notes where applicable.</li>\n</ul>\n<p>In summary, {{keyConceptTitle}} provides a thorough understanding of...</p>",
    },
  ],
  temperature: 1,
  max_tokens: 4096,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};

const _THEMES_PROMPT = {
  model: _MODEL_NAME,
  messages: [
    {
      role: "system",
      content:
        "Provide a comprehensive discussion of themes related to a key concept from a book. The analysis should examine how each theme supports, challenges, or interacts with the key concept, ensuring clarity and depth. Format the response in HTML using only paragraph, list, bold, and italic tags. Avoid including extra HTML tags or instructions.",
    },
    {
      role: "user",
      content:
        "Discuss the themes related to {{keyConceptTitle}} from the book {{bookName}} by {{authorName}}. Use {{keyConceptDescription}} as context. Provide detailed examples of how each theme supports, challenges, or develops {{keyConceptTitle}}, ensuring an in-depth analysis in HTML format (paragraph, list, bold, and italic).",
    },
    {
      role: "user",
      content: "Use the following notes for additional analysis: {{notes}}.",
    },
    {
      role: "assistant",
      content:
        "<p>The book <strong>{{bookName}}</strong> by <strong>{{authorName}}</strong> delves into <strong>{{keyConceptTitle}}</strong>. {{keyConceptDescription}}</p>\n\n<p>The themes related to {{keyConceptTitle}} include:</p>\n\n<ul>\n    <li><strong>First theme:</strong> This theme is explored by...</li>\n    <li><strong>Second theme:</strong> It interacts with {{keyConceptTitle}} by...</li>\n    <li><strong>Third theme:</strong> This theme supports {{keyConceptTitle}} by...</li>\n</ul>\n\n<p>Each theme contributes to a deeper understanding of {{keyConceptTitle}} within the context of the book.</p>",
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
      content:
        "You are an AI that provides in-depth analysis of alternate perspectives by other authors on a key concept from a book. Focus only on these alternate views, analyzing how each author's take adds to or challenges the concept. Avoid discussing the book's original themes directly. Ensure a critical, nuanced examination of each viewpoint. Use only paragraph, list, bold, and italic formats in HTML, without unnecessary tags.",
    },
    {
      role: "user",
      content:
        "Analyze alternate takes by other authors on the key concept {{keyConceptTitle}} from {{bookName}} by {{authorName}}. Use {{keyConceptDescription}} for context. Focus on how these perspectives contribute to or diverge from the understanding of {{keyConceptTitle}}. Format in HTML with paragraph, list, bold, and italic elements only.",
    },
    {
      role: "user",
      content: "Use following notes to supplement the analysis: {{notes}}",
    },
    {
      role: "assistant",
      content:
        "<p>The book <strong>{{bookName}}</strong> by <strong>{{authorName}}</strong> introduces <strong>{{keyConceptTitle}}</strong>. {{keyConceptDescription}}</p><p>Alternate perspectives include:</p><ul><li><strong>[Author 1]</strong>: <specific aspect> challenges {{authorName}}'s view, with implications such as <consequences>.</li><li><strong>[Author 2]</strong>: Offers a novel view on <specific focus> that alters the interpretation by <explanation>.</li><li><strong>[Author 3]</strong>: Uses <framework> to suggest a different understanding of {{keyConceptTitle}}, expanding the discussion by <details>.</li></ul><p>These perspectives add layers to the understanding of <strong>{{keyConceptTitle}}</strong>.</p>",
    },
  ],
  temperature: 1,
  max_tokens: 4096,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};

const _FURTHER_REFERENCES_PROMPT = {
  model: _MODEL_NAME,
  messages: [
    {
      role: "system",
      content:
        "List books related to the themes of {{keyConceptTitle}} from {{bookName}} by {{authorName}}. Include book name, author, and a detailed analysis of how each book explores themes similar to {{bookName}}. Analyze how these themes support, challenge, or interact with the key concept. Format in HTML using list, bold, and italic tags. No extra text or HTML tags.",
    },
    {
      role: "user",
      content:
        "List books related to {{keyConceptTitle}} from {{bookName}} by {{authorName}}. Use {{keyConceptDescription}} for context. Include book name, author, and analysis of how each book's themes relate to {{bookName}}. Describe how these themes support, challenge, or interact with the key concept. Output in HTML format (list, bold, italic).",
    },
    {
      role: "user",
      content: "Use these notes for additional analysis: {{notes}}.",
    },
    {
      role: "assistant",
      content:
        "<ul>\n    <li><strong>{{RecommendedBook1}} by {{Author1}}:</strong> This book explores themes similar to {{keyConceptTitle}} by...</li>\n    <li><strong>{{RecommendedBook2}} by {{Author2}}:</strong> It addresses themes that interact with {{keyConceptTitle}} through...</li>\n    <li><strong>{{RecommendedBook3}} by {{Author3}}:</strong> This book supports the themes related to {{keyConceptTitle}} by...</li>\n</ul>",
    },
  ],

  temperature: 1,
  max_tokens: 4096,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};

const _MINI_ESSAY_PROMPT = {
  model: _MODEL_NAME,
  messages: [
    {
      role: "system",
      content:
        "Provide a detailed, continuous mini-essay on {{keyConceptTitle}} from {{bookName}} by {{authorName}}. Integrate themes naturally, use clear language with smooth transitions, and format the output in HTML paragraphs. Exclude extraneous tags or text, and avoid self-references and apologies.",
    },
    {
      role: "user",
      content:
        "Analyze {{keyConceptTitle}} based on {{keyConceptDescription}}. Connect it with other themes in the book.",
    },
    {
      role: "user",
      content: "Use following notes to supplement the analysis: {{notes}}",
    },
  ],
  temperature: 1,
  max_tokens: 4096,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};

const _EXPLAIN_TO_CHILD_PROMPT = {
  model: _MODEL_NAME,
  messages: [
    {
      role: "system",
      content:
        "Explain {{keyConceptTitle}} from {{bookName}} by {{authorName}} in a way that's easy for a small child to understand. Use simple words, short sentences, and relatable examples. Make sure to format the response in HTML paragraphs, without extra tags or text, and avoid self-references and apologies.",
    },
    {
      role: "user",
      content:
        "Describe {{keyConceptTitle}} in a fun and easy way, connecting it to simple ideas and stories that a child would understand.",
    },
    {
      role: "user",
      content: "Use these notes to help explain: {{notes}}",
    },
  ],
  temperature: 1,
  max_tokens: 4096,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};
