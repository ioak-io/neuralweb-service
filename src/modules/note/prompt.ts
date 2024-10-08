import * as Handlebars from "handlebars";
import { cloneDeep } from "lodash";

const _MODEL_NAME_GPT3 = "gpt-3.5-turbo";
const _MODEL_NAME_GPT4 = "gpt-4o";
const _MODEL_NAME = process.env.CHATGPT_MODEL_NAME || "gpt-4o-mini";;

export const getBrainstormPrompt = (
  useBookMode: boolean,
  text: string,
  instructions: string,
  bookName: string,
  authorName: string
) => {
  const brainstormPrompt = useBookMode
    ? cloneDeep(_BRAINSTORM_WITH_BOOK_PROMPT)
    : cloneDeep(_BRAINSTORM_PROMPT);
  brainstormPrompt.messages[brainstormPrompt.messages.length - 1].content =
    Handlebars.compile(
      brainstormPrompt.messages[brainstormPrompt.messages.length - 1].content
    )({
      baseText: text,
      instructions,
      bookName,
      authorName,
      modelName: _MODEL_NAME,
    });
    console.log(brainstormPrompt)
  return brainstormPrompt;
};

const _PROMPT_SECTION_INTRODUCTION = {
  role: "system",
  content:
    "You are an expert in transforming freehanded base texts into concise and well-structured content. Your task is to modify the base text into clear and concise content according to the given instructions. Do not include any common heading or title in your response.",
};

const _PROMPT_SECTION_INTRODUCTION_WITH_BOOK = {
  role: "system",
  content:
    "You are an expert in transforming freehanded base texts into concise and well-structured content. Your task is to modify the base text into clear and concise content according to the given instructions, using the provided book details. Do not mention the book name or author name in the generated content.",
};

const _PROMPT_SECTION_HTML_ENCODING = {
  role: "system",
  content:
    "Always use raw HTML tags for formatting. For example, use <b> for bold, <i> for italic, etc. Do not use markdown syntax like ** for bold or * for italic.",
};

const _PROMPT_SECTION_HTML_SUPPORTED_FORMATS = {
  role: "system",
  content:
    "Limit HTML to basic formatting like bold, italic, underline, bullet lists, numbered lists, h4, and h5. Do not include any additional HTML document structure or prefixes like 'html\\n'.",
};

const _PROMPT_SECTION_INPUT_QUALITY_CHECK = {
  role: "system",
  content:
    "Carefully evaluate the instructions provided, including any numbers or details, to ensure they are relevant and meaningful for transforming the base text. If the instructions are unclear, irrelevant, or you cannot reliably generate content based on them, prefix your response with 'MORE_INFO_NEEDED' and ask for clarification.",
};

const _PROMPT_SECTION_BOOK_REFERENCE = {
  role: "system",
  content:
    "If the book name and author name are provided and matching books are found, proceed with the most relevant book without asking for additional details. If the book name is provided but the author name is missing and multiple books with the same name exist, prefix your response with 'BOOK_NOT_FOUND' and specify that the author name is needed. If the book name and/or author name cannot be found, prefix your response with 'BOOK_NOT_FOUND' and indicate that the book details could not be verified.",
};

const _PROMPT_SECTION_INPUT_MEANINGNESS_CHECK = {
  role: "system",
  content:
    "Do not return the base text unchanged. If the instructions do not allow for a meaningful transformation, indicate that by prefacing your response with 'MORE_INFO_NEEDED'.",
};

const _PROMPT_SECTION_FORM_WITHOUT_BOOK = {
  role: "user",
  content: "Base Text: {{baseText}}\nInstructions: {{instructions}}",
};

const _PROMPT_SECTION_FORM_WITH_BOOK = {
  role: "user",
  content:
    "Base Text: {{baseText}}\nInstructions: {{instructions}}\nBook: {{bookName}}, Author: {{authorName}}",
};

const _BRAINSTORM_PROMPT = {
  model: _MODEL_NAME,
  messages: [
    _PROMPT_SECTION_INTRODUCTION,
    _PROMPT_SECTION_HTML_ENCODING,
    _PROMPT_SECTION_HTML_SUPPORTED_FORMATS,
    _PROMPT_SECTION_INPUT_QUALITY_CHECK,
    _PROMPT_SECTION_INPUT_MEANINGNESS_CHECK,
    _PROMPT_SECTION_FORM_WITHOUT_BOOK,
  ],
  temperature: 1,
  max_tokens: 4096,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};

const _BRAINSTORM_WITH_BOOK_PROMPT = {
  model: _MODEL_NAME,
  messages: [
    _PROMPT_SECTION_INTRODUCTION_WITH_BOOK,
    _PROMPT_SECTION_HTML_ENCODING,
    _PROMPT_SECTION_HTML_SUPPORTED_FORMATS,
    _PROMPT_SECTION_INPUT_QUALITY_CHECK,
    _PROMPT_SECTION_BOOK_REFERENCE,
    _PROMPT_SECTION_INPUT_MEANINGNESS_CHECK,
    _PROMPT_SECTION_FORM_WITH_BOOK,
  ],
  temperature: 1,
  max_tokens: 4096,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};

export const getAutoGeneratedAttributesPrompt = (
  text: string,
  labels: string[]
) => {
  const prompt = cloneDeep(_AUTO_GENERATED_ATTRUBUTES_PROMPT);
  prompt.messages[prompt.messages.length - 1].content = Handlebars.compile(
    prompt.messages[prompt.messages.length - 1].content
  )({
    text,
    labels,
    modelName: _MODEL_NAME,
  });
  return prompt;
};

const _AUTO_GENERATED_ATTRUBUTES_PROMPT = {
  model: _MODEL_NAME,
  messages: [
    {
      role: "system",
      content:
        "You are an AI that generates optimized content based on user inputs. Your task is to create a short title and summary for an essay provided by the user. The title should not contain a colon character (:). Additionally, you will evaluate a set of labels and select those relevant to the essay. If none of the provided labels are relevant, you will generate 2-3 new labels that better suit the essay. All labels, including the primary label, should be in lowercase, and the primary label must be selected from the relevant labels. The output should be a JSON object with the fields: title, summary, labels, and primaryLabel.",
    },
    {
      role: "system",
      content:
        "Please generate a short title and summary for the essay. Ensure the title does not contain a colon character (:). Choose relevant labels from the provided set, or generate new ones if necessary, and select a primary label. The output should be in a JSON object with the fields: title, summary, labels, and primaryLabel.",
    },
    {
      role: "user",
      content: "Essay Text: {{text}}\nLabels: {{labels}}",
    },
  ],
  temperature: 1,
  max_tokens: 4096,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};
