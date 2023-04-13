const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { uniq } from "lodash";
import { notelinkCollection, notelinkSchema } from "./model";
const { getCollection } = require("../../lib/dbutils");
import { nextval } from "../sequence/service";
import * as NoteHelper from "../note/helper";

export const getNotelink = async (
  space: string
) => {
  const model = getCollection(space, notelinkCollection, notelinkSchema);

  const data = await model.find();
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

export const getPossibleLinksByReference = async (
  space: string,
  reference: string
) => {
  const model = getCollection(space, notelinkCollection, notelinkSchema);

  const backlinks = await model.find({ linkedNoteRef: reference });

  const excludeNoteRefList: string[] = [];
  backlinks.forEach((item: any) => {
    excludeNoteRefList.push(item.sourceNoteRef);
  });

  const note = await NoteHelper.getNoteByReference(space, reference);

  if (!note) {
    return [];
  }

  const res = await NoteHelper.searchNoteByText(space, note.name);
  const backlinkDetailList: any[] = [];

  res.forEach((item: any) => {
    if (!excludeNoteRefList.includes(item.reference)) {
      backlinkDetailList.push({
        sourceNoteRef: item.reference,
        sourceNote: item,
        linkedNoteRef: reference,
      });
    }
  });

  return backlinkDetailList;
};

export const addPossibleLink = async (
  space: string,
  sourceReference: string,
  linkedReference: string
) => {
  const model = getCollection(space, notelinkCollection, notelinkSchema);

  const sourceNote = await NoteHelper.getNoteByReference(
    space,
    sourceReference
  );
  const linkedNote = await NoteHelper.getNoteByReference(
    space,
    linkedReference
  );

  if (!sourceNote || !linkedNote) {
    return {};
  }

  const _sourceNote = {
    ...sourceNote._doc,
    content: sourceNote.content.replace(
      new RegExp(linkedNote.name, "ig"),
      `[[${linkedNote.reference}]]`
    ),
  };

  await NoteHelper.updateNote(space, _sourceNote);

  return {};
};


export const saveNotelink = async (
  space: string,
  sourceNoteRef: string,
  linkedNoteRef: string
) => {
  const model = getCollection(space, notelinkCollection, notelinkSchema);

  return await model.create({
    sourceNoteRef, linkedNoteRef
  });
};


export const deleteNotelink = async (
  space: string,
  sourceNoteRef: string,
  linkedNoteRef: string
) => {
  const model = getCollection(space, notelinkCollection, notelinkSchema);

  await model.remove({
    sourceNoteRef: linkedNoteRef, linkedNoteRef: sourceNoteRef
  });

  return await model.remove({
    sourceNoteRef, linkedNoteRef
  });
};
