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

export const getConceptSectionPrompt = (
  type: string,
  bookName: string,
  authorName: string,
  keyConceptTitle: string,
  keyConceptDescription: string,
  themes: string,
  noteList: string[]
) => {
  const notes = noteList.join("/n");
  console.log("****", noteList.length);
  console.log(themes);
  switch (type) {
    case "summary":
      return getPrompt(_SUMMARY_PROMPT, {
        bookName,
        authorName,
        keyConceptTitle,
        keyConceptDescription,
        notes,
        themes,
      });
    case "central_insights":
      return getPrompt(_CENTRAL_INSIGHTS, {
        bookName,
        authorName,
        keyConceptTitle,
        keyConceptDescription,
        notes,
        themes,
      });
    case "mini_essay":
      return getPrompt(_MINI_ESSAY_PROMPT, {
        bookName,
        authorName,
        keyConceptTitle,
        keyConceptDescription,
        notes,
        themes,
      });
    case "themes":
      return getPrompt(_THEMES_PROMPT, {
        bookName,
        authorName,
        keyConceptTitle,
        keyConceptDescription,
        notes,
        themes,
      });
    case "alternate_takes":
      return getPrompt(_ALTERNATE_TAKES_PROMPT, {
        bookName,
        authorName,
        keyConceptTitle,
        keyConceptDescription,
        notes,
        themes,
      });
    case "further_references":
      return getPrompt(_FURTHER_REFERENCES_PROMPT, {
        bookName,
        authorName,
        keyConceptTitle,
        keyConceptDescription,
        notes,
        themes,
      });
    case "explain_to_child":
      return getPrompt(_EXPLAIN_TO_CHILD_PROMPT, {
        bookName,
        authorName,
        keyConceptTitle,
        keyConceptDescription,
        notes,
        themes,
      });

    default:
      break;
  }
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

const _THEMES_PROMPT = {
  model: _MODEL_NAME,
  messages: [
    {
      role: "system",
      content: [
        "You are an AI language model that provides deep and detailed analysis of key concepts from books.",
        "Your responses should be insightful, comprehensive, and structured clearly using paragraphs, bulleted lists, and numbered lists.",
        "Responses should be formatted in HTML, including only paragraphs (<p>), bulleted lists (<ul> and <li>), numbered lists (<ol> and <li>), bold (<strong>), and italic (<em>) tags.",
        "Avoid using heading tags like <h1>, <h2>, etc., and any other extraneous tags or text.",
        "The content should be in an explanatory style, avoiding third-person commentary.",
        "Focus on examining key themes and their significance in relation to the concept while considering historical, cultural, and scholarly interpretations.",
        "Maintain a formal and academic tone throughout the analysis.",
        "Use the following structure for each theme:",
        "Provide a clear and concise title for each theme.",
        "Explain why each theme has been identified as a main theme related to the key concept.",
        "Explore the theme by covering its relation to the key concept, its significance within the broader context of the book, supporting arguments or examples from the author, potential critiques or limitations of the theme, and how it contributes to the overall understanding of the key concept.",
        "Structure the response clearly using paragraphs, bulleted lists, and numbered lists.",
        "Avoid introductory or concluding text; focus only on specific content.",
      ],
    },
    {
      role: "user",
      content: [
        "Follow the instructions in the System role always.",
        "Keep those instructions in context all the time.",
        "Conduct a comprehensive, deep, and detailed analysis of the key concept '{{keyConceptTitle}}' in {{authorName}}'s book '{{bookName}}'.",
        "This concept can be briefly described as {{keyConceptShortDescription}}.",
        "Identify and explore three main themes related to {{keyConceptTitle}} as presented in the book. For each theme:",
        "Explain why the theme is significant in relation to {{keyConceptTitle}}.",
        "Discuss how the theme relates to {{keyConceptTitle}} and its importance within the broader context of the book.",
        "Integrate examples or arguments provided by the author that support the theme.",
        "Mention any critiques or limitations of the theme, blending these aspects naturally into the discussion.",
        "Elaborate on how this theme contributes to a deeper understanding of {{keyConceptTitle}}, ensuring the narrative flows organically rather than being rigidly structured.",
        "Consider the historical and cultural context of the book, relevant scholarly interpretations, and your knowledge of {{authorName}}'s work.",
        "Use any additional notes or extracts provided to enhance context, but ensure that these are not treated as primary sources or references. They should serve to provide supplementary information, and the analysis should primarily rely on your own knowledge base and broader perspectives.",
        "Ensure the analysis demonstrates a deep understanding of the key concept, its complexities, and its significance within '{{bookName}}' and beyond.",
      ],
    },
    {
      role: "user",
      content: [
        "Please use the following notes to provide additional context for the analysis of the key concept '{{keyConceptTitle}}' in {{authorName}}'s book '{{bookName}}'.",
        "These notes are supplementary and should not be treated as primary sources or references.",
        "They are meant to enhance the context but should not overshadow the key concept.",
        "Ensure that your analysis primarily relies on your own knowledge base and broader perspectives.",
        "{{notes}}",
      ],
    },
    {
      role: "assistant",
      content: [
        "[ThemeTitle1] reveals [reason for significance] and is closely linked to {{keyConceptTitle}} through [relation to keyConceptTitle]. The author uses [examples or arguments] to bring this theme to life, underscoring its depth and complexity. While there are some limitations or alternative viewpoints, such as [critiques], these do not overshadow the theme's ability to enhance our grasp of {{keyConceptTitle}} by [how it contributes], enriching our understanding of the book's core ideas.",
        "[ThemeTitle2] plays a crucial role due to [reason for significance]. Its connection to {{keyConceptTitle}} is demonstrated through [relation to keyConceptTitle], which weaves it into the broader narrative of the book. The author's use of [examples or arguments] highlights its importance and effect. However, perspectives such as [critiques] offer a broader view on this theme’s reach. This theme deepens our insight into {{keyConceptTitle}} by [how it contributes], helping to unpack the complexities of the key concept.",
        "[ThemeTitle3] stands out because [reason for significance]. It ties into {{keyConceptTitle}} through [relation to keyConceptTitle] and is emphasized by [broader significance]. The author reinforces this theme with [examples or arguments], although different viewpoints such as [critiques] bring additional considerations. Despite these differing perspectives, the theme adds valuable layers to our understanding of {{keyConceptTitle}} by [how it contributes], offering a richer interpretation of the key concept.",
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
        "You are an AI that provides in-depth analysis of alternate perspectives by other authors on a key concept from a book.",
        "Focus only on these alternate views, analyzing how each author's take adds to or challenges the concept.",
        "Avoid discussing the book's original themes directly.",
        "Use the specific author names, rather than placeholders like [Author 1], [Author 2], etc.",
        "Ensure a critical, nuanced examination of each viewpoint.",
        "The notes provided are strictly for contextual understanding and should only be used where they are relevant to the book and the key concept being explored.",
        "However, they should not be treated as a source of information.",
        "You should rely on your own knowledge base to explain the concept and not use the notes as a foundation for building your logic.",
        "Use only paragraph, list, bold, and italic formats in HTML, without unnecessary tags.",
      ],
    },
    {
      role: "user",
      content: [
        "Analyze alternate takes by other authors on the key concept {{keyConceptTitle}} from {{bookName}} by {{authorName}}.",
        "Use {{keyConceptDescription}} for context.",
        "Focus on how these perspectives contribute to or diverge from the understanding of {{keyConceptTitle}}.",
        "Format in HTML with paragraph, list, bold, and italic elements only.",
      ],
    },
    {
      role: "user",
      content: [
        "Use the following notes for contextual understanding only, and only where relevant to the book and key concept.",
        "Do not directly use these notes as a source for building your explanation: {{notes}}",
      ],
    },
    {
      role: "assistant",
      content: [
        "<ul>",
        "<li><strong>{{AuthorName1}}</strong>: <specific aspect> challenges {{authorName}}'s view, with implications such as <consequences>.</li>",
        "<li><strong>{{AuthorName2}}</strong>: Offers a novel view on <specific focus> that alters the interpretation by <explanation>.</li>",
        "<li><strong>{{AuthorName3}}</strong>: Uses <framework> to suggest a different understanding of {{keyConceptTitle}}, expanding the discussion by <details>.</li>",
        "</ul>",
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
        "List books related to the themes of {{keyConceptTitle}} from {{bookName}} by {{authorName}}.",
        "Include book name, author, and a detailed analysis of how each book explores themes similar to {{bookName}}.",
        "Analyze how these themes support, challenge, or interact with the key concept.",
        "The notes provided are strictly for contextual understanding and should only be used where they are relevant to the book and the key concept being explored.",
        "However, they should not be treated as a source of information.",
        "You should rely on your own knowledge base to explain the concept and not use the notes as a foundation for building your logic.",
        "Format in HTML using list, bold, and italic tags.",
        "No extra text or HTML tags.",
      ],
    },
    {
      role: "user",
      content: [
        "List books related to {{keyConceptTitle}} from {{bookName}} by {{authorName}}.",
        "Use {{keyConceptDescription}} for context.",
        "Include book name, author, and analysis of how each book's themes relate to {{bookName}}.",
        "Describe how these themes support, challenge, or interact with the key concept.",
        "Output in HTML format (list, bold, italic).",
      ],
    },
    {
      role: "user",
      content: [
        "Use the following notes for contextual understanding only, and only where relevant to the book and key concept.",
        "Do not directly use these notes as a source for building your explanation: {{notes}}",
      ],
    },
    {
      role: "assistant",
      content: [
        "<ul>",
        "<li><strong>{{RecommendedBook1}} by {{Author1}}:</strong> This book explores themes similar to {{keyConceptTitle}} by...</li>",
        "<li><strong>{{RecommendedBook2}} by {{Author2}}:</strong> It addresses themes that interact with {{keyConceptTitle}} through...</li>",
        "<li><strong>{{RecommendedBook3}} by {{Author3}}:</strong> This book supports the themes related to {{keyConceptTitle}} by...</li>",
        "</ul>",
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

const _CENTRAL_INSIGHTS = {
  model: _MODEL_NAME,
  messages: [
    {
      role: "system",
      content: [
        "Describe key textual elements or events that develop {{keyConceptTitle}} in {{bookName}} by {{authorName}};",
        "Present each element with an HTML <b> tag for the title followed by the exact text from the book, including specific details and quotes;",
        "After each quote, provide a detailed supplementary explanation in an HTML <p> tag that includes various perspectives and significant developments related to the key concept;",
        "Ensure comprehensive coverage by integrating different facets and changes impacting the concept;",
        "The notes provided are strictly for contextual understanding and should only be used where they are relevant to the book and the key concept being explored;",
        "They should not be treated as a source of information. You should rely on your own knowledge base to explain the concept and not use the notes as a foundation for building your logic;",
        "Use HTML <p> tags for each section and <b> tags for titles, and avoid any prefixes or additional formatting issues.",
      ],
    },
    {
      role: "user",
      content: [
        "List key elements or events that develop {{keyConceptTitle}} in {{bookName}} by {{authorName}};",
        "Use {{keyConceptDescription}} for context;",
        "Provide the exact text from the book, including specific details or quotes, followed by detailed supplementary explanations in HTML <p> tags;",
        "Ensure that the explanations cover different perspectives, key events, and significant developments related to the key concept;",
        "Avoid prefixes like 'html' and any interpretive commentary or citation details.",
      ],
    },
    {
      role: "user",
      content: [
        "Use the following notes for contextual understanding only, and only where relevant to the book and key concept;",
        "Do not directly use these notes as a source for building your explanation: {{notes}}",
      ],
    },
    {
      role: "assistant",
      content: [
        "<p><b>{KeyTextualElement1Title}:</b> {ExactTextFromBook1}</p>",
        "<p>{DetailedExplanation1}</p>",
        "<p><b>{KeyTextualElement2Title}:</b> {ExactTextFromBook2}</p>",
        "<p>{DetailedExplanation2}</p>",
        "<p><b>{KeyTextualElement3Title}:</b> {ExactTextFromBook3}</p>",
        "<p>{DetailedExplanation3}</p>",
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
