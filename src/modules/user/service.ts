import bcrypt from "bcrypt";
import { validateMandatoryFields } from "../../lib/validation";

import { userSchema, userCollection } from "../user/model";
import * as Helper from "./helper";
import * as userInviteHelper from "../user/invite/helper";
import * as companyHelper from "../company/helper";
import { getCollection } from "../../lib/dbutils";
import { encodeAppToken } from "../auth/helper";

const selfRealm = 100;

export const validateSession = async (req: any, res: any) => {
  const session: any = await Helper.validateSession(
    req.body.accessToken,
    req.body.refreshToken,
    req.params.realmId
  );
  if (!session) {
    res.status(404);
    res.send("Session not found");
    res.end();
    return;
  }
  res.status(200);
  res.send(session);
  res.end();
};

export const getUsers = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const userList: any = await Helper.getUsers();
  res.status(200);
  res.send(userList);
  res.end();
};

export const getLocalToken = async (req: any, res: any) => {
  const accessToken = req.headers["authorization"];
  if (!accessToken) {
    return res.sendStatus(401);
  }
  const appToken = await getLocalTokenImpl(req.user.user_id, accessToken);
  res.status(200);
  res.send({ token: appToken });
  res.end();
};

export const getLocalTokenImpl = async (
  userId: string,
  accessToken: string
) => {
  const userInviteList = await userInviteHelper.getUserInviteByUserId(userId);
  const companyIdList: string[] = [];
  userInviteList.forEach((item: any) => {
    companyIdList.push(item.companyId);
  });
  const companyList = await companyHelper.getCompanyByIdList(companyIdList);
  const companyReferenceList: string[] = [];

  companyList.forEach((item: any) => {
    companyReferenceList.push(item.reference);
  });

  const claims = {
    accessToken,
    space: companyReferenceList,
    companyId: companyIdList,
  };
  return encodeAppToken(claims);
};

export const getUserByEmail = async (email: string) => {
  return await Helper.getUserByEmail(email);
};

export const getUserById = async (id: string) => {
  return await Helper.getUserById(id);
};
