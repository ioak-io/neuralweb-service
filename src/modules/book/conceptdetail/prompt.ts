import * as Handlebars from "handlebars";
import { cloneDeep } from "lodash";

const _MODEL_NAME_GPT3 = "gpt-3.5-turbo";
const _MODEL_NAME_GPT4 = "gpt-4o";
const _MODEL_NAME_GPT4_MINI = "gpt-4o-mini";
const _MODEL_NAME = process.env.CHATGPT_MODEL_NAME || "gpt-4o-mini";

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

export const getBookShortFormPrompt = (
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
        'You are an AI assistant tasked with creating a comprehensive analysis of a book in JSON format. The output should contain only valid JSON without any extra text, comments, or explanations. Follow the structure below:\n\n{\n  "bookOverview": {\n    "overview": "string",\n    "authorInfo": "string"\n  },\n  "keyInsights": [\n    {"title": "string", "description": "html", "summary": "string"},\n    {"title": "string", "description": "html", "summary": "string"},\n    ...\n  ]\n}.\n\nInstructions:\n\n1. For the "bookOverview":\n- Provide a detailed summary of the book\'s main premise and significance (4-5 sentences).\n- Mention the author\'s background and expertise relevant to the book\'s topic (2-3 sentences).\n\n2. For "keyInsights":\n- Each key insight should have a title and a detailed description.\n- The description must be in HTML format, with each paragraph enclosed within <p> tags. Only <p>, <b>, and <i> tags are allowed.\n- The description should include an in-depth explanation of the insight (4-5 paragraphs), practical examples or applications (2-3 paragraphs), and any relevant statistics or research mentioned in the book.\n\nGuidelines:\n- Ensure that the total word count of the output is between 2500 and 3000 words.\n- Provide only the JSON output with no additional text.',
    },
    {
      role: "assistant",
      content:
        "Ensure that each key insight is elaborated with multiple paragraphs and detailed explanations, with each paragraph enclosed in <p> tags. For each key insight in {{keyInsights}}, provide a comprehensive analysis that includes examples, applications, and supporting evidence to meet the 2500-3000 word range. Output only valid JSON.",
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

export const getConceptSectionPrompt = (
  type: string,
  bookName: string,
  authorName: string,
  keyConceptTitle: string,
  keyConceptDescription: string,
  noteList: string[]
) => {
  const notes = noteList.join(" ");
  console.log("****", noteList.length);
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
    case "central_insights":
      return _getPrompt(
        _CENTRAL_INSIGHTS,
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
        "You are an AI designed to provide a detailed, logically structured, and informative explanation of a key concept explored in a book. Ensure that your explanation directly describes the key concept without framing it as third-person commentary or narrative. Use clear, concise language to convey the information, maintaining a logical flow and coherence with smooth transitions between paragraphs. The notes provided are strictly for contextual understanding and should only be used where they are relevant to the book and the key concept being explored. However, they should not be treated as a source of information. You should rely on your own knowledge base to explain the concept and not use the notes as a foundation for building your logic. Format the output using HTML with paragraphs, lists, bold, and italic elements. Avoid including any extraneous tags or text. Do not include reminders of the user's instructions or make any self-references or apologies.",
    },
    {
      role: "user",
      content:
        "Explain the main ideas and arguments about {{keyConceptTitle}}, formatted in HTML with paragraphs, lists, bold, and italic elements. {{keyConceptDescription}}",
    },
    {
      role: "user",
      content:
        "Use the following notes for contextual understanding only, and only where relevant to the book and key concept. Do not directly use these notes as a source for building your explanation: {{notes}}",
    },
    {
      role: "assistant",
      content:
        "<p>{{keyConceptDescription}}</p>\n<ul>\n    <li>Explanation of the first key point, incorporating relevant information from the user's notes if applicable.</li>\n    <li>Explanation of the second key point, using both book knowledge and notes.</li>\n    <li>Explanation of the third key point, integrating notes where applicable.</li>\n</ul>\n<p>This concept offers a thorough understanding of...</p>",
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
        "Provide a comprehensive discussion of themes related to a key concept from a book. The analysis should examine how each theme supports, challenges, or interacts with the key concept, ensuring clarity and depth. The notes provided are strictly for contextual understanding and should only be used where they are relevant to the book and the key concept being explored. However, they should not be treated as a source of information. You should rely on your own knowledge base to explain the concept and not use the notes as a foundation for building your logic. Format the response in HTML using only paragraph, list, bold, and italic tags. Avoid third-person commentary or narrative style. Do not include extra HTML tags or instructions. Present theme titles plainly, without numbers or labels like 'Theme 1', 'Theme 2', etc.",
    },
    {
      role: "user",
      content:
        "Discuss the themes related to {{keyConceptTitle}} from the book {{bookName}} by {{authorName}}. Use {{keyConceptDescription}} as context. Provide detailed examples of how each theme supports, challenges, or develops {{keyConceptTitle}}, ensuring an in-depth analysis in HTML format (paragraph, list, bold, and italic).",
    },
    {
      role: "user",
      content:
        "Use the following notes for contextual understanding only, and only where relevant to the book and key concept. Do not directly use these notes as a source for building your explanation: {{notes}}",
    },
    {
      role: "assistant",
      content:
        "<ul>\n    <li><strong>First theme:</strong> This theme is explored by...</li>\n    <li><strong>Second theme:</strong> It interacts with {{keyConceptTitle}} by...</li>\n    <li><strong>Third theme:</strong> This theme supports {{keyConceptTitle}} by...</li>\n</ul>",
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
        "You are an AI that provides in-depth analysis of alternate perspectives by other authors on a key concept from a book. Focus only on these alternate views, analyzing how each author's take adds to or challenges the concept. Avoid discussing the book's original themes directly. Use the specific author names, rather than placeholders like [Author 1], [Author 2], etc. Ensure a critical, nuanced examination of each viewpoint. The notes provided are strictly for contextual understanding and should only be used where they are relevant to the book and the key concept being explored. However, they should not be treated as a source of information. You should rely on your own knowledge base to explain the concept and not use the notes as a foundation for building your logic. Use only paragraph, list, bold, and italic formats in HTML, without unnecessary tags.",
    },
    {
      role: "user",
      content:
        "Analyze alternate takes by other authors on the key concept {{keyConceptTitle}} from {{bookName}} by {{authorName}}. Use {{keyConceptDescription}} for context. Focus on how these perspectives contribute to or diverge from the understanding of {{keyConceptTitle}}. Format in HTML with paragraph, list, bold, and italic elements only.",
    },
    {
      role: "user",
      content:
        "Use the following notes for contextual understanding only, and only where relevant to the book and key concept. Do not directly use these notes as a source for building your explanation: {{notes}}",
    },
    {
      role: "assistant",
      content:
        "<ul><li><strong>{{AuthorName1}}</strong>: <specific aspect> challenges {{authorName}}'s view, with implications such as <consequences>.</li><li><strong>{{AuthorName2}}</strong>: Offers a novel view on <specific focus> that alters the interpretation by <explanation>.</li><li><strong>{{AuthorName3}}</strong>: Uses <framework> to suggest a different understanding of {{keyConceptTitle}}, expanding the discussion by <details>.</li></ul>",
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
        "List books related to the themes of {{keyConceptTitle}} from {{bookName}} by {{authorName}}. Include book name, author, and a detailed analysis of how each book explores themes similar to {{bookName}}. Analyze how these themes support, challenge, or interact with the key concept. The notes provided are strictly for contextual understanding and should only be used where they are relevant to the book and the key concept being explored. However, they should not be treated as a source of information. You should rely on your own knowledge base to explain the concept and not use the notes as a foundation for building your logic. Format in HTML using list, bold, and italic tags. No extra text or HTML tags.",
    },
    {
      role: "user",
      content:
        "List books related to {{keyConceptTitle}} from {{bookName}} by {{authorName}}. Use {{keyConceptDescription}} for context. Include book name, author, and analysis of how each book's themes relate to {{bookName}}. Describe how these themes support, challenge, or interact with the key concept. Output in HTML format (list, bold, italic).",
    },
    {
      role: "user",
      content:
        "Use the following notes for contextual understanding only, and only where relevant to the book and key concept. Do not directly use these notes as a source for building your explanation: {{notes}}",
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
        "Provide a comprehensive explanation of {{keyConceptTitle}} from {{bookName}} by {{authorName}}. Present the concept directly as it would be articulated in the book. The notes provided are strictly for contextual understanding and should only be used where they are relevant to the book and the key concept being explored. However, they should not be treated as a source of information. You should rely on your own knowledge base to explain the concept and not use the notes as a foundation for building your logic. Avoid commentary or third-person narrative, and instead, deliver the information in a clear, descriptive manner. Ensure that each paragraph is enclosed within <p> tags and that the explanation integrates related themes naturally and flows continuously. Exclude unnecessary tags, self-references, or apologies.",
    },
    {
      role: "user",
      content:
        "Describe {{keyConceptTitle}} based on {{keyConceptDescription}}. Illustrate its connections with other themes in the book directly and clearly.",
    },
    {
      role: "user",
      content:
        "Use the following notes for contextual understanding only, and only where relevant to the book and key concept. Do not directly use these notes as a source for building your explanation: {{notes}}",
    },
  ],
  temperature: 1,
  max_tokens: 4096,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};

const _CENTRAL_INSIGHTS = {
  model: _MODEL_NAME,
  messages: [
    {
      role: "system",
      content:
        "Describe key textual elements or events that develop {{keyConceptTitle}} in {{bookName}} by {{authorName}}. Present each element with an HTML <b> tag for the title followed by the exact text from the book, including specific details and quotes. After each quote, provide a detailed supplementary explanation in an HTML <p> tag that includes various perspectives and significant developments related to the key concept. Ensure comprehensive coverage by integrating different facets and changes impacting the concept. The notes provided are strictly for contextual understanding and should only be used where they are relevant to the book and the key concept being explored. However, they should not be treated as a source of information. You should rely on your own knowledge base to explain the concept and not use the notes as a foundation for building your logic. Use HTML <p> tags for each section and <b> tags for titles, and avoid any prefixes or additional formatting issues.",
    },
    {
      role: "user",
      content:
        "List key elements or events that develop {{keyConceptTitle}} in {{bookName}} by {{authorName}}. Use {{keyConceptDescription}} for context. Provide the exact text from the book, including specific details or quotes, followed by detailed supplementary explanations in HTML <p> tags. Ensure that the explanations cover different perspectives, key events, and significant developments related to the key concept. Avoid prefixes like 'html' and any interpretive commentary or citation details.",
    },
    {
      role: "user",
      content:
        "Use the following notes for contextual understanding only, and only where relevant to the book and key concept. Do not directly use these notes as a source for building your explanation: {{notes}}",
    },
    {
      role: "assistant",
      content:
        "<p><b>{KeyTextualElement1Title}:</b> {ExactTextFromBook1}</p>\n<p>{DetailedExplanation1}</p>\n<p><b>{KeyTextualElement2Title}:</b> {ExactTextFromBook2}</p>\n<p>{DetailedExplanation2}</p>\n<p><b>{KeyTextualElement3Title}:</b> {ExactTextFromBook3}</p>\n<p>{DetailedExplanation3}</p>",
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
        "Explain {{keyConceptTitle}} from {{bookName}} by {{authorName}} in a way that's easy for a small child to understand. Use simple words, short sentences, and relatable examples. The notes provided are strictly for contextual understanding and should only be used where they are relevant to the book and the key concept being explored. However, they should not be treated as a source of information. You should rely on your own knowledge base to explain the concept and not use the notes as a foundation for building your logic. Make sure to format the response in HTML paragraphs, without extra tags or text, and avoid self-references and apologies.",
    },
    {
      role: "user",
      content:
        "Describe {{keyConceptTitle}} in a fun and easy way, connecting it to simple ideas and stories that a child would understand.",
    },
    {
      role: "user",
      content:
        "Use the following notes for contextual understanding only, and only where relevant to the book and key concept. Do not directly use these notes as a source for building your explanation: {{notes}}",
    },
  ],
  temperature: 1,
  max_tokens: 4096,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};
