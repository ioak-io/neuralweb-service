import bcrypt from "bcrypt";
import { validateMandatoryFields } from "../../lib/validation";

import { userSchema, userCollection } from "../user/model";
import * as Helper from "./helper";
import { getCollection } from "../../lib/dbutils";

const selfRealm = 100;

export const updateFilterGroup = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const filterGroup: any = await Helper.updateFilterGroup(
    req.params.space,
    req.body,
    userId
  );
  res.status(200);
  res.send(filterGroup);
  res.end();
};

export const getFilterGroup = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const filterGroupList: any = await Helper.getFilterGroup(req.params.space);
  res.status(200);
  res.send(filterGroupList);
  res.end();
};
