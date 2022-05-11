const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { folderCollection, folderSchema } from "./model";
const { getCollection } = require("../../lib/dbutils");
import { nextval } from "../sequence/service";
import * as NoteHelper from "../note/helper";

export const updateFolder = async (
  space: string,
  data: any,
  userId?: string
) => {
  const model = getCollection(space, folderCollection, folderSchema);
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
    });
  }

  return response;
};

export const getFolder = async (space: string) => {
  const model = getCollection(space, folderCollection, folderSchema);

  return await model.find();
};

export const deleteFolder = async (space: string, id: string) => {
  const model = getCollection(space, folderCollection, folderSchema);

  const allFolders = await model.find();

  const folderIdList: string[] = _findSubFolderIdList(id, allFolders);

  await model.remove({ _id: { $in: folderIdList } });
  const noteList = await NoteHelper.getNotesByFolderIdList(space, folderIdList);
  await NoteHelper.deleteNotesByFolderIdList(space, folderIdList);

  const noteIdList: string[] = [];

  noteList.forEach((item: any) => {
    noteIdList.push(item._id);
  });

  return { folder: folderIdList, note: noteIdList };
};

const _findSubFolderIdList = (
  folderId: string,
  folderList: any[]
): string[] => {
  let res: string[] = [folderId];
  folderList
    .filter((item: any) => item.parentId === folderId)
    .forEach((item: any) => {
      res = [...res, ..._findSubFolderIdList(item._id, folderList)];
    });

  return res;
};
