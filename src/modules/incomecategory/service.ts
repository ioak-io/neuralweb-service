import bcrypt from "bcrypt";
import { validateMandatoryFields } from "../../lib/validation";

import { userSchema, userCollection } from "../user/model";
import * as Helper from "./helper";
import { getCollection } from "../../lib/dbutils";

const selfRealm = 100;

export const updateIncomeCategory = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const incomeCategory: any = await Helper.updateIncomeCategory(
    req.params.space,
    req.body,
    userId
  );
  res.status(200);
  res.send(incomeCategory);
  res.end();
};

export const getIncomeCategory = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const incomeCategoryList: any = await Helper.getIncomeCategory(
    req.params.space
  );
  res.status(200);
  res.send(incomeCategoryList);
  res.end();
};
