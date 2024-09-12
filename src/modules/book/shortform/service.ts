import * as Helper from "./helper";

export const createShortform = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const shortform: any = await Helper.createShortform(
    req.params.space,
    req.params.bookref,
    req.body,
    userId
  );
  res.status(200);
  res.send(shortform);
  res.end();
};

export const updateShortform = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const shortform: any = await Helper.updateShortform(
    req.params.space,
    req.query.reload,
    req.body,
    userId
  );
  res.status(200);
  res.send(shortform);
  res.end();
};

export const getShortformsByBookReference = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const shortform: any = await Helper.getShortformsByBookReference(
    req.params.space,
    req.params.bookref,
  );
  res.status(200);
  res.send(shortform);
  res.end();
};

export const deleteShortform = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.deleteShortform(
    req.params.space,
    req.params.id
  );
  res.status(200);
  res.send(outcome);
  res.end();
};
