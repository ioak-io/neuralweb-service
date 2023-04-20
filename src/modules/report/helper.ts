const axios = require("axios");
import { intersection } from 'lodash';
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import * as NoteLinkHelper from "../notelink/helper";
import * as NoteLinkAutoHelper from "../notelink/auto/helper";
import * as NoteHelper from "../note/helper";
import { isEmptyOrSpaces } from "../../lib/Utils";
import { FORMAT_FULL_DATE, FORMAT_MONTH_AND_YEAR, formatDateText } from "../../lib/DateUtils";

const ejs = require('ejs');
const jszip = require('jszip');

const _get_template_path = (name: string) => {
  return process.cwd() + name;
}

const _get_zip_file = async (data: string) => {
  const zip = new jszip();
  zip.file("index.html", data);
  return await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

export const generateReport = async (space: string) => {

  const noteList = await NoteHelper.getNote(space);
  let html = '';
  for (let i = 0; i < noteList.length; i++) {
    html += await generateReportForNote(space, noteList[i].reference);
    html += await ejs.renderFile(_get_template_path('\\src\\templates\\partials\\template_pagebreak.ejs'), {});
  }

  return _get_zip_file(html);
}

export const generateReportForNote = async (space: string, reference: string) => {
  const note = await NoteHelper.getNoteByReference(space, reference);
  if (!note) {
    return "Note not found";
  }

  const data: any = {
    title: note.name,
    summary: note.summary,
    content: note.content,
    keywords: note.keywords,
    labels: [],
    createdAt: formatDateText(note.createdAt, FORMAT_FULL_DATE)
  };

  if (!isEmptyOrSpaces(note.primaryLabel)) {
    data.labels = [note.primaryLabel, ...note.labels.filter((item: string) => item !== note.primaryLabel)];
  }

  let html = await ejs.renderFile(_get_template_path('\\src\\templates\\template_note.ejs'), data);

  const notelinks = await NoteLinkHelper.getNotelinkByReference(space, reference);
  const notelinksAuto = await NoteLinkAutoHelper.getNotelinkAutoByNoteRef(space, reference);

  if (notelinks.length > 0) { html += await ejs.renderFile(_get_template_path('\\src\\templates\\partials\\template_section_title.ejs'), { title: "References" }); }

  for (let i = 0; i < notelinks.length; i++) {
    let linkedNoteRef = notelinks[i].linkedNoteRef;
    if (linkedNoteRef === reference) {
      linkedNoteRef = notelinks[i].sourceNoteRef;
    }
    const refNote = await generateReportForNoteRef(space, linkedNoteRef, undefined);
    html += refNote;
  }

  if (notelinksAuto.length > 0) { html += await ejs.renderFile(_get_template_path('\\src\\templates\\partials\\template_section_title.ejs'), { title: "Auto linked References" }); }

  for (let i = 0; i < notelinksAuto.length; i++) {
    let linkedNoteRef = notelinksAuto[i].linkedNoteRef;
    if (linkedNoteRef === reference) {
      linkedNoteRef = notelinksAuto[i].sourceNoteRef;
    }
    const refNote = await generateReportForNoteRef(space, linkedNoteRef, note._doc.keywords);
    html += refNote;
  }

  return _get_zip_file(html);
};

export const generateReportForNoteRef = async (space: string, reference: string, sourceKeywords?: string[]) => {
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

  data.keywords = intersection(sourceKeywords, note._doc.keywords);

  const html = ejs.renderFile(_get_template_path('\\src\\templates\\partials\\template_noteref.ejs'), data);

  return html;
};
