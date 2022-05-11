const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { filterExpenseCollection, filterExpenseSchema } from "./model";
const { getCollection } = require("../../../lib/dbutils");
import * as Helper from "./helper";
import { isEmptyOrSpaces } from "../../../lib/Utils";
import { format } from "date-fns";

const EMPTY_FILTER = {
  reserved: false,
  showInSummary: false,
  showInDashboard: false,
  from: "",
  to: "",
  description: "",
  moreThan: null,
  lessThan: null,
  days: null,
  months: null,
  monthNumber: null,
  yearNumber: null,
  categoryIdList: [],
  tagIdList: [],
  kakeiboList: [],
};

export const updateFilterExpense = async (
  space: string,
  data: any,
  userId: string
) => {
  const model = getCollection(
    space,
    filterExpenseCollection,
    filterExpenseSchema
  );
  if (data._id) {
    const existingFilters = await model.find({
      name: data.name,
      _id: { $nin: [data._id] },
    });
    if (existingFilters.length > 0) {
      return existingFilters[0];
    }
    const response = await model.findByIdAndUpdate(
      data._id,
      {
        ...data,
      },
      { new: true, upsert: true }
    );
    return response;
  }

  const existingFilters = await model.find({
    name: data.name,
  });
  if (existingFilters.length > 0) {
    return existingFilters[0];
  }

  return await model.create({ ...EMPTY_FILTER, ...data });
};

export const getFilterExpense = async (space: string) => {
  const model = getCollection(
    space,
    filterExpenseCollection,
    filterExpenseSchema
  );

  return await model.find();
};

export const getFilterExpenseById = async (space: string, id: string) => {
  const model = getCollection(
    space,
    filterExpenseCollection,
    filterExpenseSchema
  );

  return await model.find({ _id: id });
};

export const publishAllFilterExpense = async (
  space: string,
  data: any,
  userId: string
) => {
  const model = getCollection(
    space,
    filterExpenseCollection,
    filterExpenseSchema
  );

  await model.remove({});

  const responseList: any[] = [];

  for (let i = 0; i < data?.length; i++) {
    responseList.push(await model.create({ ...EMPTY_FILTER, ...data[i] }));
  }

  return responseList;
};
