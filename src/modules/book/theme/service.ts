import * as Helper from "./helper";

export const createBookTheme = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bookTheme: any = await Helper.createBookTheme(
    req.params.space,
    req.body,
    userId
  );
  res.status(200);
  res.send(bookTheme);
  res.end();
};

export const updateBookTheme = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bookTheme: any = await Helper.updateBookTheme(
    req.params.space,
    req.body,
    userId
  );
  res.status(200);
  res.send(bookTheme);
  res.end();
};

export const getBookTheme = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bookThemeList: any = await Helper.getBookTheme(req.params.space);
  res.status(200);
  res.send(bookThemeList);
  res.end();
};

export const getBookThemeById = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bookTheme: any = await Helper.getBookThemeById(
    req.params.space,
    req.params.id
  );
  res.status(200);
  res.send(bookTheme);
  res.end();
};

export const getBookThemesByBookReference = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bookTheme: any = await Helper.getBookThemesByBookReference(
    req.params.space,
    req.params.bookref
  );
  res.status(200);
  res.send(bookTheme);
  res.end();
};


export const getBookThemesByConceptReference = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bookTheme: any = await Helper.getBookThemesByConceptReference(
    req.params.space,
    req.params.bookref,
    req.params.conceptref
  );
  res.status(200);
  res.send(bookTheme);
  res.end();
};

export const getBookThemeByBookReference = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bookTheme: any = await Helper.getBookThemeByBookReference(
    req.params.space,
    req.params.bookref,
    req.params.conceptref,
    req.params.themeref
  );
  res.status(200);
  res.send(bookTheme);
  res.end();
};

export const deleteBookTheme = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.deleteBookTheme(
    req.params.space,
    req.params.id
  );
  res.status(200);
  res.send(outcome);
  res.end();
};

export const deleteBookThemeByReference = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.deleteBookThemeByReference(
    req.params.space,
    req.params.reference
  );
  res.status(200);
  res.send(outcome);
  res.end();
};
