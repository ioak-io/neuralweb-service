import bcrypt from "bcrypt";
import { validateMandatoryFields } from "../../lib/validation";

import { userSchema, userCollection } from "../user/model";
import * as Helper from "./helper";
import { getCollection } from "../../lib/dbutils";

const selfRealm = 100;

export const updateCategory = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const category: any = await Helper.updateCategory(
    req.params.space,
    req.body,
    userId
  );
  res.status(200);
  res.send(category);
  res.end();
};

export const getCategory = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const categoryList: any = await Helper.getCategory(req.params.space);
  res.status(200);
  res.send(categoryList);
  res.end();
};
