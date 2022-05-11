import bcrypt from "bcrypt";
import { validateMandatoryFields } from "../../lib/validation";

import { userSchema, userCollection } from "../user/model";
import * as Helper from "./helper";
import { getCollection } from "../../lib/dbutils";

const selfRealm = 100;

export const updateBudgetByYear = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const category: any = await Helper.updateBudgetByYear(
    req.params.space,
    req.params.year,
    req.body,
    userId
  );
  res.status(200);
  res.send(category);
  res.end();
};

export const getBudgetByYear = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const categoryList: any = await Helper.getBudgetByYear(
    req.params.space,
    req.params.year
  );
  res.status(200);
  res.send(categoryList);
  res.end();
};
