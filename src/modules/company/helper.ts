const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { companyCollection, companySchema } from "./model";
import { format } from "date-fns";
import { getGlobalCollection, getCollection } from "../../lib/dbutils";
import { create_sequence, nextval } from "../sequence/service";
import * as StopwordsHelper from '../stopwords/helper';

export const updateCompany = async (data: any, userId: string) => {
  const model = getGlobalCollection(companyCollection, companySchema);
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

  const response = await model.create({
    ...data,
    reference: await nextval("companyId"),
  });

  await create_sequence("noteId", null, 1, response.reference);
  await create_sequence("libraryId", null, 1, response.reference);

  await StopwordsHelper.resetStopwords(response.reference);

  return response;
};

export const getCompany = async () => {
  const model = getGlobalCollection(companyCollection, companySchema);

  return await model.find();
};

export const getCompanyByReference = async (reference: string) => {
  const model = getGlobalCollection(companyCollection, companySchema);

  return await model.findOne({ reference });
};

export const getCompanyByIdList = async (idList: string[]) => {
  const model = getGlobalCollection(companyCollection, companySchema);

  return await model.find({ _id: { $in: idList } });
};
