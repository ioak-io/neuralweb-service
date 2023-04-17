import * as Helper from "./helper";

const selfRealm = 100;

export const getKeywords = async (req: any, res: any) => {
  const keywords: any = await Helper.getKeywords(req.params.space);
  res.status(200);
  res.send(keywords);
  res.end();
};
