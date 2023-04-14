import * as Helper from "./helper";

const selfRealm = 100;

export const getMetadataValue = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const metadataValueList: any = await Helper.getMetadataValue(req.params.space);
  res.status(200);
  res.send(metadataValueList);
  res.end();
};
