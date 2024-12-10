import * as Helper from "./helper";

export const validateBook = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const response: any = await Helper.validateBook(req.body, userId);

  res.status(200);
  res.send(response);
  res.end();
};

export const createBook = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const book: any = await Helper.createBook(req.params.space, req.body, userId);
  // await startGenerating(req.params.space, book?.reference);

  res.status(200).send(book);

  // await SectionHelper.generateSections(req.params.space, book?.reference);

  // await finishGenerating(req.params.space, book?.reference);

  // await SectiondetailHelper.generateAllSectionSummaries(
  //   req.params.space,
  //   book?.reference
  // );
};

export const updateBook = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const book: any = await Helper.updateBook(
    req.params.space,
    req.params.id,
    req.body,
    userId
  );
  res.status(200);
  res.send(book);
  res.end();
};

export const getCoverImages = async (req: any, res: any) => {
  console.log("**");
  const userId = req.user.user_id;
  const data: any = await Helper.getCoverImages(
    req.params.space,
    req.params.reference,
    userId
  );
  res.status(200).send(data);
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
