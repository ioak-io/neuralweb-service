import bcrypt from "bcrypt";
import { validateMandatoryFields } from "../../lib/validation";

import { userSchema, userCollection } from "../user/model";
import * as Helper from "./helper";
import { getCollection } from "../../lib/dbutils";

const selfRealm = 100;

export const getTrend = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const categoryList: any = await Helper.getTrend(req.params.space, req.body);
  res.status(200);
  res.send(categoryList);
  res.end();
};

export const getWeeklyTrend = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const categoryList: any = await Helper.getWeeklyTrend(
    req.params.space,
    req.body
  );
  res.status(200);
  res.send(categoryList);
  res.end();
};

export const getYearlyTrend = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const categoryList: any = await Helper.getYearlyTrend(
    req.params.space,
    req.body
  );
  res.status(200);
  res.send(categoryList);
  res.end();
};

export const getMetric = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const categoryList: any = await Helper.getMetric(
    req.params.space,
    req.body,
    null
  );
  res.status(200);
  res.send(categoryList);
  res.end();
};

export const getBalanceTrend = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const categoryList: any = await Helper.getBalanceTrend(
    req.params.space,
    req.body
  );
  res.status(200);
  res.send(categoryList);
  res.end();
};
