const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { noteCollection, noteSchema } from "./model";
const { getCollection } = require("../../lib/dbutils");
import { nextval } from "../sequence/service";
import * as NoteTagHelper from "./tag/helper";
import * as NotelinkHelper from "../notelink/helper";
import * as FilterGroupHelper from "../filter-group/helper";
import { isEmptyOrSpaces } from "../../lib/Utils";

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
    console.log("*****", await nextval("noteId", undefined, space))
    response = await model.create({
      ...data,
      reference: await nextval("noteId", undefined, space),
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

  await NotelinkHelper.deleteBySourceNoteRef(space, noteRef);

  let linkedNoteRefList = content.match(/\[\[(\w+)\]\]/g);

  if (!linkedNoteRefList) {
    return;
  }
  linkedNoteRefList = linkedNoteRefList.map((item: string) =>
    item.replace("[[", "").replace("]]", "")
  );

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

  const res = await _enrichWithGroupColor(space, await model.find());
  return res.map((item: any) => {
    return {
      _id: item._id,
      name: item.name,
      folderId: item.folderId,
      reference: item.reference,
      color: item.color,
    };
  });
};

const _enrichWithGroupColor = async (space: string, data: any[]) => {
  const filterGroupList = await FilterGroupHelper.getFilterGroup(space);
  return data.map((item: any) => {
    let out = { ...item._doc };
    filterGroupList
      .filter(
        (item: any) =>
          !isEmptyOrSpaces(item.criteria) && !isEmptyOrSpaces(item.color)
      )
      .forEach((filter: any) => {
        const { file, path, tag, general } = getFilterKeys(filter.criteria);
        if (_processFilterPerRecord(item, file, tag, path, general)) {
          out.color = filter.color;
        }
      });
    return out;
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

export const searchNoteByText = async (space: string, text: string) => {
  const model = getCollection(space, noteCollection, noteSchema);

  const res = await model.find({
    $text: { $search: `\"${text}\"`, $caseSensitive: false },
  });
  return res;
};

export const filterNote = async (space: string, text: string) => {
  const { file, path, tag, general } = getFilterKeys(text);
  return await applyFilter(space, file, tag, path, general);
};

export const searchNote = async (space: string, text: string) => {
  const filterResults = (await filterNote(space, text))?.results || [];
  return filterResults;
};

const getFilterKeys = (criteria: string) => {
  const words = criteria
    .toLowerCase()
    .replace(/  +/g, " ")
    .trim()
    .replace(/##+/g, "#")
    .replace(/::+/g, ":")
    .replace(/ :/g, ":")
    .replace(/: /g, ":")
    .replace(/ #/g, "#")
    .replace(/# /g, "#")
    .split(" ");

  const file: string[] = [];
  const tag: string[] = [];
  const path: string[][] = [];
  const general: string[] = [];

  let currentFilter: "file" | "tag" | "path" | null = null;
  words.forEach((item: string) => {
    let word = item;
    if (item.startsWith("file:")) {
      currentFilter = "file";
      word = item.replace("file:", "");
    } else if (item.startsWith("tag:")) {
      currentFilter = "tag";
      word = item.replace("tag:", "");
    } else if (item.startsWith("path:")) {
      currentFilter = "path";
      word = item.replace("path:", "");
      path.push([]);
    }

    switch (currentFilter) {
      case "file":
        file.push(word);
        break;
      case "tag":
        tag.push(word.startsWith("#") ? word : `#${word}`);
        break;
      case "path":
        path[path.length - 1] = [...path[path.length - 1], word];
        break;
      default:
        general.push(word);
        break;
    }
  });

  return {
    file,
    path,
    tag,
    general,
  };
};

const applyFilter = async (
  space: string,
  file: string[],
  tag: string[],
  path: string[][],
  general: string[]
) => {
  const model = getCollection(space, noteCollection, noteSchema);
  const data = await model.find();
  // const noteTags = await NoteTagHelper.getTag(space);
  // const noteTagMap: any = {};
  // noteTags.forEach((item: any) => {
  //   noteTagMap[item.name.toLowerCase()] = [
  //     ...(noteTagMap[item.name.toLowerCase()] || []),
  //     item.noteRef,
  //   ];
  // });
  const results: any[] = [];
  data.forEach((item: any) => {
    const processedRecord = _processFilterPerRecord(
      item,
      file,
      tag,
      path,
      general
    );
    if (processedRecord) {
      results.push(processedRecord);
    }
  });
  return {
    results,
    words: { name: file, path, content: [...tag, ...general] },
  };
};

const _processFilterPerRecord = (
  record: any,
  file: string[],
  tag: string[],
  path: string[][],
  general: string[]
) => {
  const _recordName = record.name.toLowerCase();
  if (!file.every((item: string) => _recordName.includes(item))) {
    return null;
  }

  const _recordContent = record.content.toLowerCase();
  if (!tag.every((item: string) => _recordContent.includes(item))) {
    return null;
  }

  if (!general.every((item: string) => _recordContent.includes(item))) {
    return null;
  }

  return record;
};
