import * as Helper from "./helper";

export const createDetail = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const detail: any = await Helper.createDetail(
    req.params.space,
    req.params.bookref,
    req.body,
    userId
  );
  res.status(200);
  res.send(detail);
  res.end();
};

export const updateDetail = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const detail: any = await Helper.updateDetail(
    req.params.space,
    req.params.id,
    req.body,
    userId
  );
  res.status(200);
  res.send(detail);
  res.end();
};

export const getDetailsByBookReference = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const detail: any = await Helper.getDetailsByBookReference(
    req.params.space,
    req.params.bookref,
    req.params.conceptref
  );
  res.status(200);
  res.send(detail);
  res.end();
};

export const getDetailsByBookReferenceShortform = async (
  req: any,
  res: any
) => {
  const userId = req.user.user_id;
  const detail: any =
    await Helper.getDetailsByBookReferenceShortform(
      req.params.space,
      req.params.bookref
    );
  res.status(200);
  res.send(detail);
  res.end();
};

export const deleteDetail = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.deleteDetail(
    req.params.space,
    req.params.id
  );
  res.status(200);
  res.send(outcome);
  res.end();
};
