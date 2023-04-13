import { notelinkAutoCollection, notelinkAutoSchema } from "./model";
const { getCollection } = require("../../../lib/dbutils");

export const getNotelinkAuto = async (
  space: string
) => {
  const model = getCollection(space, notelinkAutoCollection, notelinkAutoSchema);

  const data = await model.find();
  return data;
};
