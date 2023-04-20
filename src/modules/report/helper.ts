const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import * as NoteTagHelper from "../note/tag/helper";
import * as NoteHelper from "../note/helper";
import { isEmptyOrSpaces } from "../../lib/Utils";
import { FORMAT_FULL_DATE, FORMAT_MONTH_AND_YEAR, formatDateText } from "../../lib/DateUtils";

const ejs = require('ejs');

const _get_template_path = (name: string) => {
  return process.cwd() + name;
}

export const generateReportForNote = async (space: string, reference: string) => {
  const note = await NoteHelper.getNoteByReference(space, reference);
  const data: any = {
    title: note.name,
    summary: note.summary,
    content: note.content,
    keywords: note.keywords,
    createdAt: formatDateText(note.createdAt, FORMAT_FULL_DATE)
  };

  if (!isEmptyOrSpaces(note.primaryLabel)) {
    data.labels = [note.primaryLabel, ...note.labels.filter((item: string) => item !== note.primaryLabel)];
  }

  const html = ejs.renderFile(_get_template_path('\\src\\templates\\template_note.ejs'), data);
  return html;
};
