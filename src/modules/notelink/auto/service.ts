import * as Helper from "./helper";

export const getNotelinkAuto = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const notelinkAutoList: any = await Helper.getNotelinkAuto(
    req.params.space
  );
  res.status(200);
  res.send(notelinkAutoList);
  res.end();
};
