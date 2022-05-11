import bcrypt from "bcrypt";
import { validateMandatoryFields } from "../../lib/validation";

import { userSchema, userCollection } from "../user/model";
import * as Helper from "./helper";
import { getCollection } from "../../lib/dbutils";

const selfRealm = 100;

export const updateFolder = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const folder: any = await Helper.updateFolder(
    req.params.space,
    req.body,
    userId
  );
  res.status(200);
  res.send(folder);
  res.end();
};

export const getFolder = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const folderList: any = await Helper.getFolder(req.params.space);
  res.status(200);
  res.send(folderList);
  res.end();
};

export const deleteFolder = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.deleteFolder(
    req.params.space,
    req.params.id
  );
  res.status(200);
  res.send(outcome);
  res.end();
};
