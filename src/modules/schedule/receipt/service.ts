import * as Helper from "./helper";

const selfRealm = 100;

export const updateScheduleReceipt = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const category: any = await Helper.updateScheduleReceipt(
    req.params.space,
    req.body,
    userId
  );
  res.status(200);
  res.send(category);
  res.end();
};

export const getScheduleReceipt = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const categoryList: any = await Helper.getScheduleReceipt(req.params.space);
  res.status(200);
  res.send(categoryList);
  res.end();
};

export const getScheduleReceiptById = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bill: any = await Helper.getScheduleReceiptById(
    req.params.space,
    req.params.id
  );
  res.status(200);
  res.send(bill);
  res.end();
};

export const runTransaction = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bill: any = await Helper.runTransaction(
    req.params.space,
    req.params.id
  );
  res.status(200);
  res.send(bill);
  res.end();
};

export const deleteTransaction = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const bill: any = await Helper.deleteTransaction(
    req.params.space,
    req.params.id
  );
  res.status(200);
  res.send(bill);
  res.end();
};
