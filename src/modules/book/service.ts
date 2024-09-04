import bcrypt from "bcrypt";
import { validateMandatoryFields } from "../../lib/validation";

import { userSchema, userCollection } from "../user/model";
import * as Helper from "./helper";
import { getCollection } from "../../lib/dbutils";
import { isEmptyOrSpaces } from "../../lib/Utils";

const selfRealm = 100;

export const validateBook = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const response: any = await Helper.validateBook(
    req.params.space,
    req.body,
    userId
  );

  res.status(200);
  res.send(response);
  res.end();
};

export const createBook = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const book: any = await Helper.createBook(req.params.space, req.body, userId);
  res.status(200);
  res.send(book);
  res.end();
};

export const updateBook = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const book: any = await Helper.updateBook(
    req.params.space,
    req.query.reload,
    req.body,
    userId
  );
  res.status(200);
  res.send(book);
  res.end();
};

export const getBook = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bookList: any = await Helper.getBook(req.params.space);
  res.status(200);
  res.send(bookList);
  res.end();
};

export const getLibraries = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bookList: any = await Helper.getLibraries(req.params.space);
  res.status(200);
  res.send(bookList);
  res.end();
};

export const getBookById = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const book: any = await Helper.getBookById(req.params.space, req.params.id);
  res.status(200);
  res.send(book);
  res.end();
};

export const getBookByReference = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const book: any = await Helper.getBookByReference(
    req.params.space,
    req.params.reference
  );
  res.status(200);
  res.send(book);
  res.end();
};

export const searchBook = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const book: any = await Helper.searchBook(
    req.params.space,
    req.body.text,
    req.body.textList,
    req.body.searchPref
  );
  res.status(200);
  res.send(book);
  res.end();
};

export const deleteBook = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.deleteBook(req.params.space, req.params.id);
  res.status(200);
  res.send(outcome);
  res.end();
};

export const deleteBookByReference = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.deleteBookByReference(
    req.params.space,
    req.params.reference
  );
  res.status(200);
  res.send(outcome);
  res.end();
};
