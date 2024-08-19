const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { uniq } from "lodash";
import { notelinkCollection, notelinkSchema } from "./model";
const { getCollection } = require("../../lib/dbutils");
import { nextval } from "../sequence/service";
import * as NoteHelper from "../note/helper";

export const getNotelink = async (space: string) => {
  const model = getCollection(space, notelinkCollection, notelinkSchema);

  const data = await model.find();
  return data;
};

export const getNotelinkByReference = async (
  space: string,
  reference: string
) => {
  const model = getCollection(space, notelinkCollection, notelinkSchema);

  const data = await model.find({
    $or: [{ sourceNoteRef: reference }, { linkedNoteRef: reference }],
  });
  return data;
};

export const getNotelinkOld = async (
  space: string,
  noteref: string,
  depth: string
) => {
  const model = getCollection(space, notelinkCollection, notelinkSchema);

  const data = await model.find();

  if (!noteref || !depth) {
    return data;
  }

  const _nearestLinks = _getNearestLinks(data, [noteref], parseInt(depth));

  return _nearestLinks;
};

const _getNearestLinks = (
  data: any[],
  noteref: string[],
  depth: number
): any[] => {
  let nearestLinks = data.filter(
    (item: any) =>
      noteref.includes(item.sourceNoteRef) ||
      noteref.includes(item.linkedNoteRef)
  );

  if (depth === 1) {
    return nearestLinks;
  }

  const nextNoteRef: string[] = [];
  nearestLinks.forEach((item: any) => {
    nextNoteRef.push(item.sourceNoteRef);
    nextNoteRef.push(item.linkedNoteRef);
  });

  return [
    ...nearestLinks,
    ..._getNearestLinks(data, uniq(nextNoteRef), depth - 1),
  ];
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
  return await model.deleteMany({ sourceNoteRef });
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

export const saveNotelink = async (
  space: string,
  sourceNoteRef: string,
  linkedNoteRef: string
) => {
  const model = getCollection(space, notelinkCollection, notelinkSchema);

  return await model.create({
    sourceNoteRef,
    linkedNoteRef,
  });
};

export const deleteNotelink = async (
  space: string,
  sourceNoteRef: string,
  linkedNoteRef: string
) => {
  const model = getCollection(space, notelinkCollection, notelinkSchema);

  return await model.deleteMany({
    sourceNoteRef,
    linkedNoteRef,
  });
};

export const deleteNotelinkByReference = async (
  space: string,
  reference: string
) => {
  const model = getCollection(space, notelinkCollection, notelinkSchema);

  await model.deleteMany({
    $or: [{ sourceNoteRef: reference }, { linkedNoteRef: reference }],
  });
};

export const deleteNotelinkByReferenceList = async (
  space: string,
  reference: string[]
) => {
  const model = getCollection(space, notelinkCollection, notelinkSchema);

  await model.deleteMany({
    $or: [
      { sourceNoteRef: { $in: reference } },
      { linkedNoteRef: { $in: reference } },
    ],
  });
};
