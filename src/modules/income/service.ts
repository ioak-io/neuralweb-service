import bcrypt from "bcrypt";
import { validateMandatoryFields } from "../../lib/validation";

import { userSchema, userCollection } from "../user/model";
import * as Helper from "./helper";
import { getCollection } from "../../lib/dbutils";

const selfRealm = 100;

export const updateIncome = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const income: any = await Helper.updateIncome(
    req.params.space,
    req.body,
    userId
  );
  res.status(200);
  res.send(income);
  res.end();
};

export const getIncome = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const incomeList: any = await Helper.getIncome(req.params.space);
  res.status(200);
  res.send(incomeList);
  res.end();
};

export const searchIncome = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const incomeList: any = await Helper.searchIncome(req.params.space, req.body);
  res.status(200);
  res.send(incomeList);
  res.end();
};
