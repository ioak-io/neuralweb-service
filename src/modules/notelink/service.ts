import bcrypt from "bcrypt";
import { validateMandatoryFields } from "../../lib/validation";

import { userSchema, userCollection } from "../user/model";
import * as Helper from "./helper";
import { getCollection } from "../../lib/dbutils";

const selfRealm = 100;

export const getNotelink = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const notelinkList: any = await Helper.getNotelink(
    req.params.space
  );
  res.status(200);
  res.send(notelinkList);
  res.end();
};

export const saveNotelink = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.saveNotelink(
    req.params.space,
    req.params.sourceReference,
    req.params.linkedReference
  );
  res.status(200);
  res.send(outcome);
  res.end();
};


export const deleteNotelink = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.deleteNotelink(
    req.params.space,
    req.params.sourceReference,
    req.params.linkedReference
  );
  res.status(200);
  res.send(outcome);
  res.end();
};