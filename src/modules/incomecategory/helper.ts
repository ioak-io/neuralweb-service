const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { incomeCategoryCollection, incomeCategorySchema } from "./model";
const { getCollection } = require("../../lib/dbutils");
import * as ExpenseHelper from "../expense/helper";

export const updateIncomeCategory = async (
  space: string,
  data: any,
  userId?: string
) => {
  const model = getCollection(
    space,
    incomeCategoryCollection,
    incomeCategorySchema
  );
  if (data._id) {
    const response = await model.findByIdAndUpdate(
      data._id,
      {
        ...data,
      },
      { new: true, upsert: true }
    );
    return response;
  }

  return await model.create(data);
};

export const getIncomeCategory = async (space: string) => {
  const model = getCollection(
    space,
    incomeCategoryCollection,
    incomeCategorySchema
  );

  return await model.find();
};

export const deleteByTransactionId = async (
  space: string,
  transactionId: string
) => {
  const model = getCollection(
    space,
    incomeCategoryCollection,
    incomeCategorySchema
  );

  const incomeCategoryList = await model.find({
    transactionId,
  });

  const incomeCategoryIdList = await ExpenseHelper.getUnmappedCategories(
    space,
    incomeCategoryList
  );

  return await model.remove({
    _id: { $in: incomeCategoryIdList },
  });
};
