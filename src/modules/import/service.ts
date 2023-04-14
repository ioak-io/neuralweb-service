import * as Helper from "./helper";

const selfRealm = 100;

export const importExpense = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const response: any = await Helper.importExpense(
    req.params.space,
    req.file,
    userId
  );
  res.status(200);
  res.send(response);
  res.end();
};

export const exportData = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const response: any = await Helper.exportData(req.params.space, userId);
  res.status(200);
  res.send(response);
  res.end();
};

export const deleteTransaction = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const response: any = await Helper.deleteTransaction(
    req.params.space,
    req.params.transactionId,
    userId
  );
  res.status(200);
  res.send(response);
  res.end();
};
