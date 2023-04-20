import bcrypt from "bcrypt";
import { validateMandatoryFields } from "../../lib/validation";

import { userSchema, userCollection } from "../user/model";
import * as Helper from "./helper";
import { getCollection } from "../../lib/dbutils";

const selfRealm = 100;

export const generateReportForNote = async (req: any, res: any) => {
  const report: any = await Helper.generateReportForNote(req.params.space, req.params.noteRef);
  res.status(200);
  res.send(report);
  res.end();
};
