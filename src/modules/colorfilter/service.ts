import * as Helper from "./helper";

const selfRealm = 100;

export const updateColorfilter = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const colorfilter: any = await Helper.updateColorfilter(req.params.space, req.body, userId);
  res.status(200);
  res.send(colorfilter);
  res.end();
};

export const updateColorfilterItem = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const colorfilter: any = await Helper.updateColorfilterItem(req.params.space, req.body);
  res.status(200);
  res.send(colorfilter);
  res.end();
};

export const getColorfilter = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const colorfilterList: any = await Helper.getColorfilter(req.params.space);
  res.status(200);
  res.send(colorfilterList);
  res.end();
};


export const deleteColorfilter = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.deleteColorfilter(req.params.space, req.params.id);
  res.status(200);
  res.send(outcome);
  res.end();
};

export const moveUp = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.move(req.params.space, req.params.id, 'up');
  res.status(200);
  res.send(outcome);
  res.end();
};

export const moveDown = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.move(req.params.space, req.params.id, 'down');
  res.status(200);
  res.send(outcome);
  res.end();
};
