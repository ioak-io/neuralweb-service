const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { accountCollection, accountSchema } from "./model";
const { getCollection } = require("../../lib/dbutils");
import * as Helper from "./helper";
import { getDayOfYear } from "date-fns";

export const getAccount = async (space: string) => {
  const model = getCollection(space, accountCollection, accountSchema);

  return await model.find({});
};

export const updateAccount = async (space: string, data: any) => {
  const model = getCollection(space, accountCollection, accountSchema);
  await model.remove({});
  return await model.insertMany(data);
};
