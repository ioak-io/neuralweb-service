import * as Helper from "./helper";

export const generateConcepts = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const response: any = await Helper.generateConcepts(
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

export const createBookConcept = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bookConcept: any = await Helper.createBookConcept(
    req.params.space,
    req.body,
    userId
  );
  res.status(200);
  res.send(bookConcept);
  res.end();
};

export const updateBookConcept = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bookConcept: any = await Helper.updateBookConcept(
    req.params.space,
    req.body,
    userId
  );
  res.status(200);
  res.send(bookConcept);
  res.end();
};

export const getBookConcept = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bookConceptList: any = await Helper.getBookConcept(req.params.space);
  res.status(200);
  res.send(bookConceptList);
  res.end();
};

export const getBookConceptById = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bookConcept: any = await Helper.getBookConceptById(
    req.params.space,
    req.params.id
  );
  res.status(200);
  res.send(bookConcept);
  res.end();
};

export const getBookConceptsByBookReference = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bookConcept: any = await Helper.getBookConceptsByBookReference(
    req.params.space,
    req.params.bookref
  );
  res.status(200);
  res.send(bookConcept);
  res.end();
};

export const getBookConceptByBookReference = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bookConcept: any = await Helper.getBookConceptByBookReference(
    req.params.space,
    req.params.bookref,
    req.params.conceptref
  );
  res.status(200);
  res.send(bookConcept);
  res.end();
};

export const deleteBookConcept = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.deleteBookConcept(
    req.params.space,
    req.params.id
  );
  res.status(200);
  res.send(outcome);
  res.end();
};

export const deleteBookConceptByReference = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.deleteBookConceptByReference(
    req.params.space,
    req.params.reference
  );
  res.status(200);
  res.send(outcome);
  res.end();
};
