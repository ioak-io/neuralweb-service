const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { filterGroupCollection, filterGroupSchema } from "./model";
const { getCollection } = require("../../lib/dbutils");
import * as Helper from "./helper";
import { isEmptyOrSpaces } from "../../lib/Utils";
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

export const updateFilterGroup = async (
  space: string,
  data: any,
  userId: string
) => {
  const model = getCollection(space, filterGroupCollection, filterGroupSchema);
  let response = null;
  if (data._id) {
    response = await model.findByIdAndUpdate(
      data._id,
      {
        ...data,
      },
      { new: true, upsert: true }
    );
  } else {
    response = await model.create(data);
  }

  return response;
};

export const getFilterGroup = async (space: string) => {
  const model = getCollection(space, filterGroupCollection, filterGroupSchema);

  return await model.find();
};
