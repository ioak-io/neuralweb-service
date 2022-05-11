const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { categoryCollection, categorySchema } from "./model";
const { getCollection } = require("../../lib/dbutils");
import * as ExpenseHelper from "../expense/helper";

export const updateCategory = async (
  space: string,
  data: any,
  userId?: string
) => {
  const model = getCollection(space, categoryCollection, categorySchema);
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

export const getCategory = async (space: string) => {
  const model = getCollection(space, categoryCollection, categorySchema);

  return await model.find();
};

export const deleteByTransactionId = async (
  space: string,
  transactionId: string
) => {
  const model = getCollection(space, categoryCollection, categorySchema);

  const categoryList = await model.find({
    transactionId,
  });

  const categoryIdList = await ExpenseHelper.getUnmappedCategories(
    space,
    categoryList
  );

  return await model.remove({
    _id: { $in: categoryIdList },
  });
};
