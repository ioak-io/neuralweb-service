import * as Helper from "./helper";

export const createBookSubtheme = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bookSubtheme: any = await Helper.createBookSubtheme(
    req.params.space,
    req.body,
    userId
  );
  res.status(200);
  res.send(bookSubtheme);
  res.end();
};

export const updateBookSubtheme = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bookSubtheme: any = await Helper.updateBookSubtheme(
    req.params.space,
    req.body,
    userId
  );
  res.status(200);
  res.send(bookSubtheme);
  res.end();
};

export const getBookSubtheme = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bookSubthemeList: any = await Helper.getBookSubtheme(req.params.space);
  res.status(200);
  res.send(bookSubthemeList);
  res.end();
};

export const getBookSubthemeById = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bookSubtheme: any = await Helper.getBookSubthemeById(
    req.params.space,
    req.params.id
  );
  res.status(200);
  res.send(bookSubtheme);
  res.end();
};

export const getBookSubthemesByBookReference = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bookSubtheme: any = await Helper.getBookSubthemesByBookReference(
    req.params.space,
    req.params.bookref
  );
  res.status(200);
  res.send(bookSubtheme);
  res.end();
};

export const getBookSubthemeByBookReference = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bookSubtheme: any = await Helper.getBookSubthemeByBookReference(
    req.params.space,
    req.params.bookref,
    req.params.conceptref,
    req.params.subthemeref
  );
  res.status(200);
  res.send(bookSubtheme);
  res.end();
};

export const deleteBookSubtheme = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.deleteBookSubtheme(
    req.params.space,
    req.params.id
  );
  res.status(200);
  res.send(outcome);
  res.end();
};

export const deleteBookSubthemeByReference = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.deleteBookSubthemeByReference(
    req.params.space,
    req.params.reference
  );
  res.status(200);
  res.send(outcome);
  res.end();
};
