const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { notelinkCollection, notelinkSchema } from "./model";
const { getCollection } = require("../../lib/dbutils");
import { nextval } from "../sequence/service";
import * as NoteHelper from "../note/helper";

export const getNotelink = async (space: string) => {
  const model = getCollection(space, notelinkCollection, notelinkSchema);

  return await model.find();
};
export const getBacklinksByReference = async (
  space: string,
  reference: string
) => {
  const model = getCollection(space, notelinkCollection, notelinkSchema);

  const backlinks = await model.find({ linkedNoteRef: reference });
  const linkedNoteRefList: string[] = [];

  if (backlinks.length === 0) {
    return [];
  }

  backlinks.forEach((item: any) => {
    linkedNoteRefList.push(item.sourceNoteRef);
  });

  const noteList = await NoteHelper.getNotesByReferenceList(
    space,
    linkedNoteRefList
  );
  const noteMap: any = {};
  noteList.forEach((item: any) => {
    noteMap[item.reference] = item;
  });

  const backlinkDetailList: any[] = [];

  backlinks.forEach((item: any) => {
    if (noteMap[item.sourceNoteRef]) {
      backlinkDetailList.push({
        ...item._doc,
        sourceNote: noteMap[item.sourceNoteRef],
      });
    }
  });

  return backlinkDetailList;
};

export const deleteBySourceNoteRef = async (
  space: string,
  sourceNoteRef: string
) => {
  const model = getCollection(space, notelinkCollection, notelinkSchema);
  return await model.remove({ sourceNoteRef });
};

export const addLinksForSourceNoteRef = async (
  space: string,
  sourceNoteRef: string,
  linkedNoteRefList: string[]
) => {
  const model = getCollection(space, notelinkCollection, notelinkSchema);
  const data: any[] = [];
  linkedNoteRefList.forEach((linkedNoteRef: string) => {
    data.push({
      sourceNoteRef,
      linkedNoteRef,
    });
  });
  return await model.insertMany(data);
};
