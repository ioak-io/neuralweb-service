import * as Handlebars from "handlebars";
import { cloneDeep } from "lodash";
const axios = require("axios");
const DODO_URL = process.env.DODO_URL || "https://api.ioak.io:8120";
const DODO_KEY = process.env.DODO_KEY || "a53dc337-a203-4980-bfc8-12f19acddd26";
const _MODEL_NAME = process.env.CHATGPT_MODEL_NAME || "gpt-4o-mini";

export const predict = async (payload: any) => {
  try {
    const response = await axios.post(
      `${DODO_URL}/api/chatgpt/v1/chat/completions`,
      payload,
      {
        headers: {
          authorization: DODO_KEY,
        },
      }
    );

    if (response.status === 200) {
      console.log("GPT RESPONSE");
      // console.log(response.data.data);
      if (
        response.data?.data?.choices.length > 0 &&
        response.data?.data?.choices[0]?.message?.content
      ) {
        return response.data?.data?.choices[0]?.message?.content
          .replace(/```json/g, "")
          .replace(/```/g, "");
      }
    }
  } catch (err) {
    console.log("*", err);
    return {};
  }

  return null;
};

export const replaceVariables = (content: string | string[], context: any) => {
  if (Array.isArray(content)) {
    return content.map((item) => Handlebars.compile(item)(context)).join("\n");
  } else if (typeof content === "string") {
    return Handlebars.compile(content)(context);
  } else {
    throw new Error("Unsupported content type");
  }
};

export const getPrompt = (_prompt: any, context: any) => {
  const prompt = cloneDeep(_prompt);
  for (let i = 0; i < prompt.messages.length; i++) {
    prompt.messages[i].content = replaceVariables(prompt.messages[i].content, {
      modelName: _MODEL_NAME,
      ...context,
    });
  }
  console.log(prompt);
  return prompt;
};
