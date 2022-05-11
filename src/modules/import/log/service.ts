import * as Helper from "./helper";

const selfRealm = 100;

export const getLog = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const logList: any = await Helper.getLog(req.params.space);
  res.status(200);
  res.send(logList);
  res.end();
};
