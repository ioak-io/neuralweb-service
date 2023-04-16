import bcrypt from "bcrypt";
import { validateMandatoryFields } from "../../lib/validation";

import { userSchema, userCollection } from "../user/model";
import * as Helper from "./helper";
import { getCollection } from "../../lib/dbutils";

const selfRealm = 100;

export const train_similarity_model = async (req: any, res: any) => {
  const note: any = await Helper.train_similarity_model(req.params.space);
  res.status(200);
  res.send(note);
  res.end();
};
