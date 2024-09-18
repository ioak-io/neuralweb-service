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
  content: string,
  excludedBooks: string
) => {
  switch (type) {
    case "context":
      return getPrompt(_SHORTEN_CONTENT_PROMPT, {
        bookName,
        authorName,
        content,
      });
    case "further_references":
      return getPrompt(_FURTHER_REFERENCES_PROMPT, {
        bookName,
        authorName,
        content,
        excludedBooks,
      });
    default:
      break;
  }
};

export const getSummarySectionPrompt = (
  bookName: string,
  authorName: string,
  keyConceptTitle: string,
  keyConceptDescription: string,
  themes: string,
  noteList: string[]
) => {
  const notes = noteList.join("/n");
  return getPrompt(_SUMMARY_PROMPT, {
    bookName,
    authorName,
    keyConceptTitle,
    keyConceptDescription,
    notes,
    themes,
  });
};

export const getBookShortFormPrompt = (
  bookName: string,
  authorName: string,
  notesList: string[],
  keyInsightsList: string[]
) => {
  const keyInsights = keyInsightsList.join(", ");
  const notes = notesList.join("\n");
  return getPrompt(_SHORTFORM_PROMPT, {
    bookName,
    authorName,
    notes,
    keyInsights,
  });
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

// export const getConceptSectionPrompt = (
//   type: string,
//   bookName: string,
//   authorName: string,
//   keyConceptTitle: string,
//   keyConceptDescription: string,
//   themes: string,
//   noteList: string[]
// ) => {
//   const notes = noteList.join("/n");
//   console.log("****", noteList.length);
//   console.log(themes);
//   switch (type) {
//     case "summary":
//       return getPrompt(_SUMMARY_PROMPT, {
//         bookName,
//         authorName,
//         keyConceptTitle,
//         keyConceptDescription,
//         notes,
//         themes,
//       });
//     case "central_insights":
//       return getPrompt(_CENTRAL_INSIGHTS, {
//         bookName,
//         authorName,
//         keyConceptTitle,
//         keyConceptDescription,
//         notes,
//         themes,
//       });
//     case "mini_essay":
//       return getPrompt(_MINI_ESSAY_PROMPT, {
//         bookName,
//         authorName,
//         keyConceptTitle,
//         keyConceptDescription,
//         notes,
//         themes,
//       });
//     case "themes":
//       return getPrompt(_THEMES_PROMPT, {
//         bookName,
//         authorName,
//         keyConceptTitle,
//         keyConceptDescription,
//         notes,
//         themes,
//       });
//     case "alternate_takes":
//       return getPrompt(_ALTERNATE_TAKES_PROMPT, {
//         bookName,
//         authorName,
//         keyConceptTitle,
//         keyConceptDescription,
//         notes,
//         themes,
//       });
//     case "further_references":
//       return getPrompt(_FURTHER_REFERENCES_PROMPT, {
//         bookName,
//         authorName,
//         keyConceptTitle,
//         keyConceptDescription,
//         notes,
//         themes,
//       });
//     case "explain_to_child":
//       return getPrompt(_EXPLAIN_TO_CHILD_PROMPT, {
//         bookName,
//         authorName,
//         keyConceptTitle,
//         keyConceptDescription,
//         notes,
//         themes,
//       });

//     default:
//       break;
//   }
// };

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
      role: "system",
      content: [
        "You are an AI designed to provide a detailed, logically structured, and informative explanation of a key concept explored in the book {{bookName}} by {{authorName}}.",
        "Ensure that your explanation directly describes the key concept without framing it as third-person commentary or narrative.",
        "Use clear, concise language to convey the information, maintaining a logical flow and coherence with smooth transitions between paragraphs.",
        "The notes provided are strictly for contextual understanding and should only be used where they are relevant to the book and the key concept being explored.",
        "However, they should not be treated as a source of information.",
        "You should rely on your own knowledge base to explain the concept and not use the notes as a foundation for building your logic.",
        "Format the output using HTML with paragraphs, lists, bold, and italic elements.",
        "Avoid including any extraneous tags or text.",
        "Ensure that the output always follows this structure:",
        "  - A few introductory paragraphs explaining the key concept.",
        "  - A bulleted list of key points, with the titles of each point bolded.",
        "  - A final few paragraphs to conclude the explanation.",
      ],
    },
    {
      role: "user",
      content: [
        "Explain the main ideas and arguments about {{keyConceptTitle}} from {{bookName}} by {{authorName}}, formatted in HTML with paragraphs, lists, bold, and italic elements.",
        "{{keyConceptDescription}}",
      ],
    },
    {
      role: "user",
      content: [
        "Use the following notes for contextual understanding only, and only where relevant to {{bookName}} by {{authorName}} and the key concept.",
        "Do not directly use these notes as a source for building your explanation:",
        "{{notes}}",
      ],
    },
    {
      role: "user",
      content: [
        "Here are the relevant themes for context in {{bookName}} by {{authorName}}:",
        "{{themes}}",
      ],
    },
    {
      role: "assistant",
      content: [
        "<p>{{keyConceptDescription}}</p>",
        "<p><strong>Key Ideas of {{keyConceptTitle}}:</strong></p>",
        "<ul>",
        "    <li><strong>{{KeyPointTitle1}}:</strong> {{KeyPointDescription1}}</li>",
        "    <li><strong>{{KeyPointTitle2}}:</strong> {{KeyPointDescription2}}</li>",
        "    <li><strong>{{KeyPointTitle3}}:</strong> {{KeyPointDescription3}}</li>",
        "</ul>",
        "<p>{{ConclusionParagraph1}}</p>",
        "<p>{{ConclusionParagraph2}}</p>",
      ],
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
      content: [
        "Provide a comprehensive explanation of {{keyConceptTitle}} from {{bookName}} by {{authorName}};",
        "Present the concept directly as it would be articulated in the book;",
        "The notes provided are strictly for contextual understanding and should only be used where they are relevant to the book and the key concept being explored;",
        "However, they should not be treated as a source of information;",
        "You should rely on your own knowledge base to explain the concept and not use the notes as a foundation for building your logic;",
        "Avoid commentary or third-person narrative, and instead, deliver the information in a clear, descriptive manner;",
        "Ensure that each paragraph is enclosed within <p> tags and that the explanation integrates related themes naturally and flows continuously;",
        "Exclude unnecessary tags, self-references, or apologies.",
      ],
    },
    {
      role: "user",
      content: [
        "Describe {{keyConceptTitle}} based on {{keyConceptDescription}};",
        "Illustrate its connections with other themes in the book directly and clearly.",
      ],
    },
    {
      role: "user",
      content: [
        "Use the following notes for contextual understanding only, and only where relevant to the book and key concept;",
        "Do not directly use these notes as a source for building your explanation: {{notes}}",
      ],
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
      content: [
        "Explain {{keyConceptTitle}} from {{bookName}} by {{authorName}} in a way that's easy for a small child to understand.",
        "Use simple words, short sentences, and relatable examples.",
        "The notes provided are strictly for contextual understanding and should only be used where they are relevant to the book and the key concept being explored.",
        "They should not be treated as a source of information.",
        "You should rely on your own knowledge base to explain the concept and not use the notes as a foundation for building your logic.",
        "Make sure to format the response in HTML paragraphs, without extra tags or text, and avoid self-references and apologies.",
      ],
    },
    {
      role: "user",
      content: [
        "Describe {{keyConceptTitle}} in a fun and easy way, connecting it to simple ideas and stories that a child would understand.",
      ],
    },
    {
      role: "user",
      content: [
        "Use the following notes for contextual understanding only, and only where relevant to the book and key concept.",
        "Do not directly use these notes as a source for building your explanation:",
        "{{notes}}",
      ],
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
      content: [
        "You are an AI designed to provide a list of references for further learning based on the provided content.",
        "Your task is to generate a list of references to other books or research papers that could deepen understanding or provide additional perspectives.",
        "The output must be strictly in JSON format, without any preceding or additional text.",
        "Each reference should be a JSON object with four fields: 'book', 'author', 'centralIdeas', and 'summary'.",
        "'book' should contain the book name or the research paper title.",
        "'author' should contain the author name.",
        "'centralIdeas' should be an array list of 2-5 central ideas from the book or research paper, highlighting the core concepts discussed.",
        "'summary' should be a 2-5 line explanation of the key concepts in this reference book. The summary may or may not be related to the main content, but it should independently highlight the key concepts from the reference book.",
      ],
    },
    {
      role: "user",
      content: [
        "Provide a list of references to other books or research papers for further learning based on the main content from the book {{bookName}} by {{authorName}}. For each reference, include the following details:",
        "1. 'book' field for the book name or research paper title.",
        "2. 'author' field for the author name.",
        "3. 'centralIdeas' field as an array list of 2-5 central ideas from the reference book or research paper.",
        "4. 'summary' field as a 2-5 line explanation of the key concepts in this reference book or paper.",
        "The summary can be related or unrelated to the main content, but should highlight the concepts independently.",
        "Ensure that none of the following books are included in the recommendations (leave blank if no exclusions):",
        "{{excludedBooks}}",
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
