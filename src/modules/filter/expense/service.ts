import bcrypt from "bcrypt";
import { validateMandatoryFields } from "../../../lib/validation";

import { userSchema, userCollection } from "../../user/model";
import * as Helper from "./helper";
import { getCollection } from "../../../lib/dbutils";

const selfRealm = 100;

export const updateFilterExpense = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const filterExpense: any = await Helper.updateFilterExpense(
    req.params.space,
    req.body,
    userId
  );
  res.status(200);
  res.send(filterExpense);
  res.end();
};

export const getFilterExpense = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const filterExpenseList: any = await Helper.getFilterExpense(
    req.params.space
  );
  res.status(200);
  res.send(filterExpenseList);
  res.end();
};

export const publishAllFilterExpense = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const filterExpense: any = await Helper.publishAllFilterExpense(
    req.params.space,
    req.body,
    userId
  );
  res.status(200);
  res.send(filterExpense);
  res.end();
};
