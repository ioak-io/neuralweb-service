import * as Helper from "./helper";

export const generateChapters = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const response: any = await Helper.generateChapters(
    req.params.space,
    req.params.bookref
  );
  if (!response) {
    res.status(404);
    res.send({
      errorMessage: "ISBN not found",
    });
    res.end();
  } else {
    res.status(200);
    res.send(response);
    res.end();
  }
};

export const createBookChapter = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bookChapter: any = await Helper.createBookChapter(
    req.params.space,
    req.body,
    userId
  );
  res.status(200);
  res.send(bookChapter);
  res.end();
};

export const updateBookChapter = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bookChapter: any = await Helper.updateBookChapter(
    req.params.space,
    req.body,
    userId
  );
  res.status(200);
  res.send(bookChapter);
  res.end();
};

export const getBookChapter = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bookChapterList: any = await Helper.getBookChapter(req.params.space);
  res.status(200);
  res.send(bookChapterList);
  res.end();
};

export const getBookChapterById = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bookChapter: any = await Helper.getBookChapterById(
    req.params.space,
    req.params.id
  );
  res.status(200);
  res.send(bookChapter);
  res.end();
};

export const getBookChaptersByBookReference = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bookChapter: any = await Helper.getBookChaptersByBookReference(
    req.params.space,
    req.params.bookref
  );
  res.status(200);
  res.send(bookChapter);
  res.end();
};

export const getBookChapterByBookReference = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bookChapter: any = await Helper.getBookChapterByBookReference(
    req.params.space,
    req.params.bookref,
    req.params.chapterref
  );
  res.status(200);
  res.send(bookChapter);
  res.end();
};

export const deleteBookChapter = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.deleteBookChapter(
    req.params.space,
    req.params.id
  );
  res.status(200);
  res.send(outcome);
  res.end();
};

export const deleteBookChapterByReference = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.deleteBookChapterByReference(
    req.params.space,
    req.params.reference
  );
  res.status(200);
  res.send(outcome);
  res.end();
};
