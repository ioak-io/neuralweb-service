import { imageToText } from "./service";
import * as Gptutils from "../../lib/gptutils";
import { getCleanTextPrompt, getFlastCardPrompt } from "./prompt";

export const importFileForFlashcard = async (
  space: string,
  files: any,
  userId: string
) => {
  const text = await imageToText(files);
  // const gptResponseText = await Gptutils.predict(getFlastCardPrompt(text));
  // console.log(gptResponseText);
  // const gptResponse = JSON.parse(gptResponseText);
  // return gptResponse;
  const gptResponseText = await Gptutils.predict(getCleanTextPrompt(text));
  return gptResponseText;
};
