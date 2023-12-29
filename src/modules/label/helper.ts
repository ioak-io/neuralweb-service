const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import * as NoteTagHelper from "../note/tag/helper";
import * as NoteHelper from "../note/helper";

export const getLabel = async (space: string) => {
  const noteTags = await NoteTagHelper.getTag(space);
  const labels = await NoteHelper.getLabels(space);

  // const labels: string[] = [];

  // noteTags.forEach((item: any) => {
  //   if (!labels.includes(item.name)) {
  //     labels.push(item.name);
  //   }
  // })

  return labels;
};
