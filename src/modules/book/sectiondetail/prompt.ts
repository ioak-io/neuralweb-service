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
  themesContext: string
) => {
  switch (type) {
    case "context":
      return getPrompt(_SHORTEN_CONTENT_PROMPT, {
        bookName,
        authorName,
        content,
      });
    case "themes":
      return getPrompt(_THEMES_PROMPT, {
        bookName,
        authorName,
        content,
      });
    case "alternate_takes":
      return getPrompt(_ALTERNATE_TAKES_PROMPT, {
        bookName,
        authorName,
        content: themesContext || content,
      });
    case "purpose":
      return getPrompt(_PURPOSE_PROMPT, {
        bookName,
        authorName,
        content: themesContext || content,
      });
    default:
      break;
  }
};

export const getSummarySectionPrompt = (
  bookName: string,
  authorName: string,
  sectionName: string,
  sectionSummary: string
) => {
  return getPrompt(_SUMMARY_PROMPT, {
    bookName,
    authorName,
    sectionName,
    sectionSummary,
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

export const getShortenThemesPrompt = (
  bookName: string,
  authorName: string,
  content: string
) => {
  return getPrompt(_SHORTEN_THEMES_PROMPT, {
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
        "You are an AI designed to provide a concise summary of a particular section or chapter from a specific book.",
        "Your summary should focus on the key events, explanations, or discussions presented in that section or chapter.",
        "Include references to the book name and author name to provide context for later prompts.",
        "Avoid unnecessary details and focus on the most important content relevant to the section being summarized.",
        "When in doubt, it is safer to retain content rather than remove it. Ensure that the key points from the section or chapter are preserved.",
      ],
    },
    {
      role: "user",
      content: [
        "Summarize the following section or chapter into a shorter, concise version suitable for further analysis or interpretation. Include references to the book name {{bookName}} and author {{authorName}} in the summary:",
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

const _SHORTEN_THEMES_PROMPT = {
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
        "You are an AI assistant and an expert book reader.",
        "Your task is to expand the provided section summary into a highly detailed explanation, ensuring that no details are omitted.",
        "Stick strictly to explaining the content of the book without providing any analysis or interpretation.",
        "Focus entirely on providing a more in-depth explanation of the section, ensuring that every event, plot development, and character action is covered comprehensively.",
        "Do not add any extra information outside of what is already in the book.",
        "Ensure that the expanded explanation closely follows the events as they unfold in the book and mirrors the original section, but in a much more detailed manner.",
        "Do not present the explanation in a commentary style or provide any opinions. The content should read as a detailed and factual recounting of the events, actions, and details without subjective language or meta-commentary.",
        "Use <p> for paragraphs, <i> for emphasis, <b> when necessary, and bullet points where appropriate. Do not use <b> (bold) in the content field, as the title is already provided in the title field.",
        'Do not include any explanations, only provide a RFC8259 compliant JSON response following this format without deviation. [{"title": "Subtitle for the first subsection", "content": "Set of paragraphs in HTML with <p> and <i> tags"}, {"title": "Subtitle for the next subsection", "content": "Set of paragraphs in HTML with <p> and <i> tags"}, {...}]',
        "Make sure to create logical subsections based on the content, and do not merge all the details into a single section.",
        "Avoid using any commentary tone or explanatory text that goes beyond the factual content of the book.",
        "Ensure that all JSON keys and strings are enclosed in double quotes to comply with RFC8259 JSON formatting.",
      ],
    },
    {
      role: "user",
      content: [
        "Expand the section summary for {{sectionName}} from the book {{bookName}} by {{authorName}}.",
        "Here is the summary: {{sectionSummary}}.",
        "Provide a detailed explanation of this section using <p> for paragraphs, <i> for emphasis, <b> when necessary, and bullet points where appropriate.",
        "Break the expanded content into logical subsections, using appropriate titles for each.",
        "Do not include any explanations, only provide a RFC8259 compliant JSON response, ensuring all keys and strings are enclosed in double quotes.",
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
        "You are an AI assistant and an expert book reader.",
        "Your task is to analyze the key themes and ideas in the provided section summary from the book {{bookName}} by {{authorName}}.",
        "Ensure the output includes a list of themes or ideas extracted from the section, with each theme accompanied by an explanation.",
        "The explanation for each theme or idea must be highly detailed and written in paragraph form, describing the theme's significance and how it appears in the section.",
        "For each theme, use <p> for paragraphs, <i> for specific words or phrases that require emphasis, and <b> only when necessary within the explanation.",
        "Use <p> for paragraphs, <i> for emphasis, <b> when necessary, and bullet points where appropriate.",
        "Do not provide any extra commentary or subjective analysis beyond the book's content.",
        "The output must be a valid JSON structure with all strings, property names, and values properly enclosed in double quotes.",
        "Structure the output as follows: [{'themeTitle': 'Title of the theme or idea', 'content': 'Set of paragraphs in HTML with <p>, <i>, <b>, and bullet points as necessary.'}, {'themeTitle': 'Next theme or idea', 'content': 'Set of paragraphs in HTML with <p>, <i>, <b>, and bullet points.'}, {...}]",
        "Each theme should be logically titled based on the content and avoid redundant information.",
        "Ensure that the JSON structure is correctly formatted with no extra spaces or errors in the syntax.",
      ],
    },
    {
      role: "user",
      content: [
        "Analyze the key themes and ideas from the book {{bookName}} by {{authorName}} for the below section summary {{content}}.",
        "Ensure that the output is structured in a JSON format with a list of themes.",
        "For each theme, provide a title in the 'themeTitle' field and a detailed explanation in the 'content' field, formatted with <p>, <i>, <b>, and bullet points where appropriate.",
        "Ensure all property names and values are double-quoted, and the output is fully JSON compliant with correct formatting.",
        "Use <p> for paragraphs, <i> for emphasis, <b> when necessary, and bullet points where appropriate. Do not add unnecessary commentary or explanations.",
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
        "You are an AI assistant with expertise in literary analysis.",
        "Your task is to provide alternate perspectives on the key themes and ideas presented in the book {{bookName}} by {{authorName}} based on the summary of key themes provided.",
        "The output should be a JSON array containing objects for each alternate perspective from different authors.",
        "Each object should include the following fields: 'author', 'book', and 'content'.",
        "The 'author' field should contain the name of the author providing the perspective.",
        "The 'book' field should contain the title of the book where the perspective is found.",
        "The 'content' field should contain a set of paragraphs in HTML format, describing the alternate perspectives on the themes. Use <p> for paragraphs, <i> for emphasis, <b> only when necessary, and bullet points if applicable.",
        "Ensure the content is detailed and provides a thorough examination of the themes from the perspective of each cited author.",
        "The JSON structure should be correctly formatted, with all strings, property names, and values enclosed in double quotes.",
        "Avoid including any unnecessary commentary or subjective opinions beyond what is provided in the alternate perspectives.",
        "The output should be a valid JSON structure with no extra spaces or syntax errors.",
      ],
    },
    {
      role: "user",
      content: [
        "Analyze the key themes and ideas from the book {{bookName}} by {{authorName}} based on the following summary of themes: {{content}}.",
        "Provide alternate perspectives on these themes by referencing other authors and their works.",
        "Structure the output in a JSON format with an array of objects. Each object should include:",
        "1. 'author': The name of the author offering the alternate perspective.",
        "2. 'book': The title of the book where the perspective is discussed.",
        "3. 'content': A set of detailed paragraphs in HTML format, discussing the alternate perspectives. Use <p> for paragraphs, <i> for emphasis, <b> when necessary, and bullet points where appropriate.",
        "Ensure that all HTML formatting is limited to <b>, <i>, and bullet points to maintain readability.",
        "Make sure the JSON output is correctly formatted with double-quoted strings, proper property names, and valid syntax.",
      ],
    },
  ],
  temperature: 1,
  max_tokens: 4096,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};

const _PURPOSE_PROMPT = {
  model: _MODEL_NAME,
  messages: [
    {
      role: "system",
      content: [
        "You are an AI assistant with expertise in literary analysis.",
        "Your task is to provide a deeper analysis of the purpose of the themes and ideas presented in the book {{bookName}} by {{authorName}} based on the summary of key themes provided.",
        "Consider how the themes fit into the larger narrative of the book, including their role in revealing critical information and their contribution to the overall structure of the book.",
        "The output should be a JSON array containing objects that offer detailed analysis of how the themes function within the book's narrative.",
        "Each object should include the following fields: 'section', 'purpose', and 'analysis'.",
        "The 'section' field should specify the section or chapter being analyzed.",
        "The 'purpose' field should describe the thematic purpose and its relevance to the book's larger narrative.",
        "The 'analysis' field should contain a set of paragraphs in HTML format, offering a thorough examination of the themes' roles and their impact on the book's structure. Use <p> for paragraphs, <i> for emphasis, <b> only when necessary, and bullet points if applicable.",
        "Ensure the content is detailed and explores how the themes contribute to the narrative's development.",
        "The JSON structure should be correctly formatted, with all strings, property names, and values enclosed in double quotes.",
        "Avoid including any unnecessary commentary or subjective opinions beyond what is provided in the thematic analysis.",
        "The output should be a valid JSON structure with no extra spaces or syntax errors.",
      ],
    },
    {
      role: "user",
      content: [
        "Analyze the purpose of the key themes and ideas from the book {{bookName}} by {{authorName}} based on the following summary of themes: {{content}}.",
        "Consider how these themes fit into the larger narrative of the book. Evaluate whether they reveal critical information or contribute to the overall structure of the book.",
        "Structure the output in a JSON format with an array of objects. Each object should include:",
        "1. 'section': The specific section or chapter being analyzed.",
        "2. 'purpose': A description of the thematic purpose and its relevance to the book's larger narrative.",
        "3. 'analysis': A set of detailed paragraphs in HTML format, discussing the role of the themes and their impact on the narrative. Use <p> for paragraphs, <i> for emphasis, <b> when necessary, and bullet points where appropriate.",
        "Ensure that all HTML formatting is limited to <b>, <i>, and bullet points to maintain readability.",
        "Make sure the JSON output is correctly formatted with double-quoted strings, proper property names, and valid syntax.",
      ],
    },
  ],
  temperature: 1,
  max_tokens: 4096,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};
