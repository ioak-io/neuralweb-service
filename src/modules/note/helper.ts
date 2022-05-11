const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { noteCollection, noteSchema } from "./model";
const { getCollection } = require("../../lib/dbutils");
import { nextval } from "../sequence/service";
import * as NoteTagHelper from "./tag/helper";
import * as NotelinkHelper from "../notelink/helper";

export const updateNote = async (space: string, data: any, userId?: string) => {
  const model = getCollection(space, noteCollection, noteSchema);
  let response = null;
  if (data._id) {
    response = await model.findByIdAndUpdate(
      data._id,
      {
        ...data,
      },
      { new: true, upsert: true }
    );
  } else {
    response = await model.create({
      ...data,
      reference: await nextval("noteId"),
    });
  }

  if (response) {
    await _populateTags(space, response);
    await _populateLinks(space, response);
  }

  return response;
};

const _populateTags = async (space: string, note: any) => {
  const noteRef = note.reference;
  const content = note.content;
  const tags = content.match(/#(\w+)/gi);

  await NoteTagHelper.deleteByNoteRef(space, noteRef);
  if (tags && tags.length > 0) {
    await NoteTagHelper.addTagsForNoteRef(space, noteRef, tags);
  }
};

const _populateLinks = async (space: string, note: any) => {
  const noteRef = note.reference;
  const content = note.content;
  let linkedNoteRefList = content.match(/\[\[(\w+)\]\]/g);

  if (!linkedNoteRefList) {
    return;
  }
  linkedNoteRefList = linkedNoteRefList.map((item: string) =>
    item.replace("[[", "").replace("]]", "")
  );

  await NotelinkHelper.deleteBySourceNoteRef(space, noteRef);
  if (linkedNoteRefList && linkedNoteRefList.length > 0) {
    await NotelinkHelper.addLinksForSourceNoteRef(
      space,
      noteRef,
      linkedNoteRefList
    );
  }
};

export const getNote = async (space: string) => {
  const model = getCollection(space, noteCollection, noteSchema);

  return await model.find();
};

export const getNoteDictionary = async (space: string) => {
  const model = getCollection(space, noteCollection, noteSchema);

  const res = await model.find();
  return res.map((item: any) => {
    return {
      _id: item._id,
      name: item.name,
      folderId: item.folderId,
      reference: item.reference,
    };
  });
};

export const getNoteByReference = async (space: string, reference: string) => {
  const model = getCollection(space, noteCollection, noteSchema);

  const res = await model.find({ reference });
  if (res.length === 0) {
    return null;
  }
  return res[0];
};

export const getNoteById = async (space: string, _id: string) => {
  const model = getCollection(space, noteCollection, noteSchema);

  const res = await model.find({ _id });
  if (res.length > 0) {
    return res[0];
  }
};

export const deleteNotesByFolderIdList = async (
  space: string,
  folderIdList: string[]
) => {
  const model = getCollection(space, noteCollection, noteSchema);

  return await model.remove({ folderId: { $in: folderIdList } });
};

export const getNotesByFolderIdList = async (
  space: string,
  folderIdList: string[]
) => {
  const model = getCollection(space, noteCollection, noteSchema);

  return await model.find({ folderId: { $in: folderIdList } });
};

export const getNotesByReferenceList = async (
  space: string,
  refList: string[]
) => {
  const model = getCollection(space, noteCollection, noteSchema);

  return await model.find({ reference: { $in: refList } });
};

export const deleteNote = async (space: string, _id: string) => {
  const model = getCollection(space, noteCollection, noteSchema);

  await model.remove({ _id });
  return { note: [_id] };
};
