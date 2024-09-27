const axios = require("axios");
import { bookLogCollection, bookLogSchema } from "./model";
const { getCollection } = require("../../../lib/dbutils");

export const startGenerating = async (
  space: string,
  bookref: string,
  sectionref?: string,
  sectiontype?: string
) => {
  const model = getCollection(space, bookLogCollection, bookLogSchema);
  await model.deleteMany({ bookref, sectionref, sectiontype });
  return await model.updateOne(
    {
      bookref,
      sectionref,
      sectiontype,
    },
    {
      $set: {
        isRunning: true,
      },
    },
    { upsert: true }
  );
};

export const finishGenerating = async (
  space: string,
  bookref: string,
  sectionref?: string,
  sectiontype?: string
) => {
  const model = getCollection(space, bookLogCollection, bookLogSchema);
  return await model.deleteMany({ bookref, sectionref, sectiontype });
};

export const getLog = async (
  space: string,
  bookref: string,
  sectionref: string,
  sectiontype: string
) => {
  const model = getCollection(space, bookLogCollection, bookLogSchema);

  await removeStaleLogs(space);

  if (!sectionref) {
    return await model.find({ bookref, sectionref: null });
  }
  if (!sectiontype) {
    return await model.find({ bookref, sectionref });
  }
  return await model.find({ bookref, sectionref, sectiontype });
};

const removeStaleLogs = async (space: string) => {
  const model = getCollection(space, bookLogCollection, bookLogSchema);
  return await model.deleteMany({
    createdAt: { $lt: new Date(Date.now() - 2 * 60 * 1000) },
  });
};
