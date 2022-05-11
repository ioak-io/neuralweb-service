const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { budgetCollection, budgetSchema } from "./model";
const { getCollection } = require("../../lib/dbutils");
import * as Helper from "./helper";
import { getDayOfYear } from "date-fns";

export const updateBudgetByYear = async (
  space: string,
  year: number,
  data: any[],
  userId: string
) => {
  const model = getCollection(space, budgetCollection, budgetSchema);
  const _payload: any[] = [];
  data.forEach((item: any) => {
    _payload.push({
      updateOne: {
        filter: {
          // _id: item._id,
          year: item.year,
          month: item.month,
          categoryId: item.categoryId,
        },
        update: {
          amount: item.amount,
        },
        upsert: true,
      },
    });
  });
  await model.bulkWrite(_payload);
  return await getBudgetByYear(space, year);
};

export const getBudgetByYear = async (space: string, year: number) => {
  const model = getCollection(space, budgetCollection, budgetSchema);

  return await model.find({ year });
};

export const getBudget = async (space: string) => {
  const model = getCollection(space, budgetCollection, budgetSchema);

  return await model.find({});
};

export const updateBudgetInBulk = async (space: string, data: any) => {
  const model = getCollection(space, budgetCollection, budgetSchema);
  const _payload: any[] = [];
  data.forEach((item: any) => {
    _payload.push({
      updateOne: {
        filter: {
          // _id: item._id,
          year: item.year,
          month: item.month,
          categoryId: item.categoryId,
        },
        update: {
          amount: item.amount,
        },
        upsert: true,
      },
    });
  });
  return await model.bulkWrite(_payload);
};

export const deleteByTransactionId = async (
  space: string,
  transactionId: string
) => {
  const model = getCollection(space, budgetCollection, budgetSchema);
  return await model.remove({ transactionId });
};
