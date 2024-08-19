import { fleetingnotelinkCollection, fleetingnotelinkSchema } from "./model";
const { getCollection } = require("../../lib/dbutils");

export const getFleetingnotelink = async (
  space: string
) => {
  const model = getCollection(space, fleetingnotelinkCollection, fleetingnotelinkSchema);

  const data = await model.find();
  return data;
};

export const getFleetingnotelinkByNoteRef = async (
  space: string,
  reference: string
) => {
  const model = getCollection(space, fleetingnotelinkCollection, fleetingnotelinkSchema);

  const data = await model.find({ '$or': [{ sourceNoteRef: reference }, { linkedNoteRef: reference }] });
  return data;
};


export const deleteNotelinkByReference = async (
  space: string, reference: string
) => {
  const model = getCollection(space, fleetingnotelinkCollection, fleetingnotelinkSchema);

  await model.deleteMany({
    '$or': [
      { sourceNoteRef: reference },
      { linkedNoteRef: reference }
    ]
  });
};
