import bcrypt from "bcrypt";
import { validateMandatoryFields } from "../../lib/validation";

import { userSchema, userCollection } from "../user/model";
import * as Helper from "./helper";
import { getCollection } from "../../lib/dbutils";

const selfRealm = 100;

export const getLabel = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const labelList: any = await Helper.getLabel(req.params.space);
  res.status(200);
  res.send(labelList);
  res.end();
};
