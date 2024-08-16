const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { fleetingnoteTagCollection, fleetingnoteTagSchema } from "./model";
const { getCollection } = require("../../../lib/dbutils");

export const getTag = async (space: string) => {
  const model = getCollection(space, fleetingnoteTagCollection, fleetingnoteTagSchema);

  return await model.find();
};

export const deleteByNoteRef = async (space: string, noteRef: string) => {
  const model = getCollection(space, fleetingnoteTagCollection, fleetingnoteTagSchema);
  return await model.remove({ noteRef });
};

export const addTagsForNoteRef = async (
  space: string,
  noteRef: string,
  tags: string[]
) => {
  const model = getCollection(space, fleetingnoteTagCollection, fleetingnoteTagSchema);
  const data: any[] = [];
  tags.forEach((name: string) => {
    data.push({
      name: name.replace("#", ""),
      noteRef,
    });
  });
  return await model.insertMany(data);
};
