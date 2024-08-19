import { notelinkAutoCollection, notelinkAutoSchema } from "./model";
const { getCollection } = require("../../../lib/dbutils");

export const getNotelinkAuto = async (space: string) => {
  const model = getCollection(
    space,
    notelinkAutoCollection,
    notelinkAutoSchema
  );

  const data = await model.find();
  return data;
};

export const getNotelinkAutoByNoteRef = async (
  space: string,
  reference: string
) => {
  const model = getCollection(
    space,
    notelinkAutoCollection,
    notelinkAutoSchema
  );

  const data = await model.find({
    $or: [{ sourceNoteRef: reference }, { linkedNoteRef: reference }],
  });
  return data;
};

export const deleteNotelinkByReference = async (
  space: string,
  reference: string
) => {
  const model = getCollection(
    space,
    notelinkAutoCollection,
    notelinkAutoSchema
  );

  await model.deleteMany({
    $or: [{ sourceNoteRef: reference }, { linkedNoteRef: reference }],
  });
};

export const deleteNotelinkByReferenceList = async (
  space: string,
  reference: string[]
) => {
  const model = getCollection(
    space,
    notelinkAutoCollection,
    notelinkAutoSchema
  );

  await model.deleteMany({
    $or: [
      { sourceNoteRef: { $in: reference } },
      { linkedNoteRef: { $in: reference } },
    ],
  });
};
