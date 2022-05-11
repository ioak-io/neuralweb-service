import * as Helper from "./helper";

const selfRealm = 100;

export const getTag = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const tagList: any = await Helper.getTag(req.params.space);
  res.status(200);
  res.send(tagList);
  res.end();
};
