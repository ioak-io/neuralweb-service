import * as Helper from "./helper";

export const createConceptDetail = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const conceptDetail: any = await Helper.createConceptDetail(
    req.params.space,
    req.params.bookref,
    req.params.conceptref,
    req.body,
    userId
  );
  res.status(200);
  res.send(conceptDetail);
  res.end();
};

export const updateConceptDetail = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const conceptDetail: any = await Helper.updateConceptDetail(
    req.params.space,
    req.params.id,
    req.body,
    userId
  );
  res.status(200);
  res.send(conceptDetail);
  res.end();
};

export const getConceptDetailsByBookReference = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const conceptDetail: any = await Helper.getConceptDetailsByBookReference(
    req.params.space,
    req.params.bookref,
    req.params.conceptref
  );
  res.status(200);
  res.send(conceptDetail);
  res.end();
};

export const getConceptDetailsByBookReferenceShortform = async (
  req: any,
  res: any
) => {
  const userId = req.user.user_id;
  const conceptDetail: any =
    await Helper.getConceptDetailsByBookReferenceShortform(
      req.params.space,
      req.params.bookref
    );
  res.status(200);
  res.send(conceptDetail);
  res.end();
};

export const deleteConceptDetail = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.deleteConceptDetail(
    req.params.space,
    req.params.id
  );
  res.status(200);
  res.send(outcome);
  res.end();
};
