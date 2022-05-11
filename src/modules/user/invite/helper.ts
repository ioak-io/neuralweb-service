const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { userInviteCollection, userInviteSchema } from "./model";
import * as companyService from "../../company/service";
import * as userService from "../service";
import { format } from "date-fns";
import { getGlobalCollection, getCollection } from "../../../lib/dbutils";

export const updateUserInvite = async (
  space: string,
  data: any,
  userId: string
) => {
  const company = await companyService.getCompanyByReference(space);
  if (!company) {
    return null;
  }
  const model = getGlobalCollection(userInviteCollection, userInviteSchema);
  const user = await userService.getUserByEmail(data.email);
  const payload = {
    ...data,
    email: data.email.toLowerCase(),
    companyId: company._id,
    accepted: !!user,
    userId: user ? user._id : null,
  };
  const existingRecord = await model.find({
    email: payload.email.toLowerCase(),
    companyId: company._id,
  });
  if (existingRecord?.length > 0) {
    return null;
  }

  return await model.create(payload);
};

export const getUserInvite = async (space: string) => {
  const company = await companyService.getCompanyByReference(space);
  if (!company) {
    return [];
  }
  const model = getGlobalCollection(userInviteCollection, userInviteSchema);

  return await model.find({ companyId: company._id });
};
export const registerUserInvite = async (
  space: string,
  companyId: any,
  userId: string,
  email: string
) => {
  const model = getGlobalCollection(userInviteCollection, userInviteSchema);
  const existingRecord = await model.find({
    email: email.toLowerCase(),
    companyId,
  });
  if (existingRecord?.length > 0) {
    return null;
  }

  return await model.create({
    companyId,
    email: email.toLowerCase(),
    userId,
    accepted: true,
  });
};

export const getUserInviteByUserId = async (userId: string) => {
  const model = getGlobalCollection(userInviteCollection, userInviteSchema);
  return await model.find({ userId });
};
