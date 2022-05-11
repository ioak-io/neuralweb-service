import bcrypt from "bcrypt";
import { validateMandatoryFields } from "../../lib/validation";

import { userSchema, userCollection } from "../user/model";
import * as Helper from "./helper";
import { getCollection } from "../../lib/dbutils";

const selfRealm = 100;

export const updateExpense = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const expense: any = await Helper.updateExpense(
    req.params.space,
    req.body,
    userId
  );
  res.status(200);
  res.send(expense);
  res.end();
};

export const getExpense = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const expenseList: any = await Helper.getExpense(req.params.space);
  res.status(200);
  res.send(expenseList);
  res.end();
};

export const searchExpense = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const expenseList: any = await Helper.searchExpense(
    req.params.space,
    req.body
  );
  res.status(200);
  res.send(expenseList);
  res.end();
};

export const aggregateExpense = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const expenseList: any = await Helper.aggregateExpense(
    req.params.space,
    req.body
  );
  res.status(200);
  res.send(expenseList);
  res.end();
};

export const getDuplicate = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const expenseList: any = await Helper.getDuplicate(
    req.params.space,
    req.body
  );
  res.status(200);
  res.send(expenseList);
  res.end();
};

export const fixDuplicate = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const expenseList: any = await Helper.fixDuplicate(
    req.params.space,
    req.body
  );
  res.status(200);
  res.send(expenseList);
  res.end();
};
