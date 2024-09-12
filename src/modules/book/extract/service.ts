import * as Helper from "./helper";

export const createExtract = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const extract: any = await Helper.createExtract(
    req.params.space,
    req.params.bookref,
    req.body,
    userId
  );
  res.status(200);
  res.send(extract);
  res.end();
};

export const updateExtract = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const extract: any = await Helper.updateExtract(
    req.params.space,
    req.params.bookref,
    req.params.id,
    req.body,
    userId
  );
  res.status(200);
  res.send(extract);
  res.end();
};

export const getExtractsByBookReference = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const extract: any = await Helper.getExtractsByBookReference(
    req.params.space,
    req.params.bookref
  );
  res.status(200);
  res.send(extract);
  res.end();
};

export const deleteExtract = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.deleteExtract(
    req.params.space,
    req.params.id
  );
  res.status(200);
  res.send(outcome);
  res.end();
};
