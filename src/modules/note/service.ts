import bcrypt from "bcrypt";
import { validateMandatoryFields } from "../../lib/validation";

import { userSchema, userCollection } from "../user/model";
import * as Helper from "./helper";
import { getCollection } from "../../lib/dbutils";

const selfRealm = 100;

export const updateNote = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const note: any = await Helper.updateNote(req.params.space, req.body, userId);
  res.status(200);
  res.send(note);
  res.end();
};

export const getNote = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const noteList: any = await Helper.getNote(req.params.space);
  res.status(200);
  res.send(noteList);
  res.end();
};

export const getNoteDictionary = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const noteList: any = await Helper.getNoteDictionary(req.params.space);
  res.status(200);
  res.send(noteList);
  res.end();
};

export const getNoteById = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const note: any = await Helper.getNoteById(req.params.space, req.params.id);
  res.status(200);
  res.send(note);
  res.end();
};

export const getNoteByReference = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const note: any = await Helper.getNoteByReference(
    req.params.space,
    req.params.reference
  );
  res.status(200);
  res.send(note);
  res.end();
};

export const searchNote = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const note: any = await Helper.searchNote(req.params.space, req.body.text);
  res.status(200);
  res.send(note);
  res.end();
};

export const deleteNote = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.deleteNote(req.params.space, req.params.id);
  res.status(200);
  res.send(outcome);
  res.end();
};
