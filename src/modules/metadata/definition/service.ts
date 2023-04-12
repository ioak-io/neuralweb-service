import * as Helper from "./helper";

const selfRealm = 100;

export const updateMetadataDefinition = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const metadataDefinition: any = await Helper.updateMetadataDefinition(req.params.space, req.body, userId);
  res.status(200);
  res.send(metadataDefinition);
  res.end();
};

export const getMetadataDefinition = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const metadataDefinitionList: any = await Helper.getMetadataDefinition(req.params.space);
  res.status(200);
  res.send(metadataDefinitionList);
  res.end();
};


export const deleteMetadataDefinition = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.deleteMetadataDefinition(req.params.space, req.params.id);
  res.status(200);
  res.send(outcome);
  res.end();
};
