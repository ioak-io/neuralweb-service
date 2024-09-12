import * as Handlebars from "handlebars";
import { cloneDeep } from "lodash";

const _MODEL_NAME_GPT3 = "gpt-3.5-turbo";
const _MODEL_NAME_GPT4 = "gpt-4o";
const _MODEL_NAME = process.env.CHATGPT_MODEL_NAME || "gpt-4o-mini";;

export const getAtomicChunksPrompt = (text: string) => {
  return _getPrompt(_ATOMIC_CHUNKS_PROMPT, text);
};

const _getPrompt = (_prompt: any, text: string) => {
  const prompt = cloneDeep(_prompt);
  for (let i = 0; i < prompt.messages.length; i++) {
    prompt.messages[i].content = Handlebars.compile(prompt.messages[i].content)(
      { text }
    );
  }
  console.log(prompt);
  return prompt;
};

const _ATOMIC_CHUNKS_PROMPT = {
  model: _MODEL_NAME,
  messages: [
    {
      role: "system",
      content:
        "You are an assistant that processes a series of sentences from a whole text and breaks them into atomic groups based on meaning and context. For each group, create a JSON array of objects where each object has two fields: 'summary' (a single sentence that condenses the group's meaning) and 'content' (a concise form made by merging related sentences). Ensure that all key points and concepts in the input text are accurately represented in the output and that no important information is missing. The groups should be formed by your understanding of the entire text, not by dividing the text into passages.",
    },
    {
      role: "user",
      content: "{{text}}",
    },
  ],
  temperature: 1,
  max_tokens: 4096,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};
