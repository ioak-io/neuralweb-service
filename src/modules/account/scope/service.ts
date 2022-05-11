import bcrypt from "bcrypt";
import { validateMandatoryFields } from "../../../lib/validation";

import { userSchema, userCollection } from "../../user/model";
import * as Helper from "./helper";
import { getCollection } from "../../../lib/dbutils";

const selfRealm = 100;

export const updateAccountScope = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.updateAccountScope(
    req.params.space,
    req.body
  );
  res.status(200);
  res.send(outcome);
  res.end();
};

export const getAccountScope = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.getAccountScope(req.params.space);
  res.status(200);
  res.send(outcome);
  res.end();
};
