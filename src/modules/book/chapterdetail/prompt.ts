import * as Handlebars from "handlebars";
import { cloneDeep } from "lodash";

const _MODEL_NAME_GPT3 = "gpt-3.5-turbo";
const _MODEL_NAME_GPT4 = "gpt-4o";
const _MODEL_NAME = process.env.CHATGPT_MODEL_NAME || "gpt-4o-mini";;

const _CHAPTER_SECTION_DEFINITIONS: {
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

export const getChapterSectionPrompt = (
  type: string,
  bookName: string,
  authorName: string,
  chapterTitle: string,
  sectionTitle?: string,
  sectionDescription?: string
) => {
  switch (type) {
    case "customManaged":
      return _getPrompt(
        _CHAPTER_SECTION_PROMPT,
        bookName,
        authorName,
        chapterTitle,
        sectionTitle,
        sectionDescription
      );

    default:
      return _getPrompt(
        _CHAPTER_SECTION_PROMPT,
        bookName,
        authorName,
        chapterTitle,
        _CHAPTER_SECTION_DEFINITIONS[type].sectionTitle,
        _CHAPTER_SECTION_DEFINITIONS[type].sectionDescription
      );
  }
};

const _getPrompt = (
  _prompt: any,
  bookName: string,
  authorName: string,
  chapterTitle: string,
  sectionTitle?: string,
  sectionDescription?: string
) => {
  const prompt = cloneDeep(_prompt);
  for (let i = 0; i < prompt.messages.length; i++) {
    prompt.messages[i].content = Handlebars.compile(prompt.messages[i].content)(
      {
        bookName,
        authorName,
        chapterTitle,
        sectionTitle,
        sectionDescription,
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

const _CHAPTER_SECTION_PROMPT = {
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
        "The output should be pure HTML content using only <p>, <b>, and <i> tags. It should consist of a series of paragraphs related to the 'sectionTitle' provided, based on the guidelines described in 'sectionDescription'. The content should be returned as a plain HTML string without any JSON or other outer structuring. Ensure that all special characters, including newlines and control characters, are properly escaped.",
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

// - section 3: explain it to a kid
// - section 4: few questions a kid (with a very fresh perspective and a playful attitude) would ask that adults (with a very serious approach to the subject) would overlook. and possible for the same
