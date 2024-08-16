import * as Helper from "./helper";

export const getFleetingnotelink = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const fleetingnotelinkList: any = await Helper.getFleetingnotelink(
    req.params.space
  );
  res.status(200);
  res.send(fleetingnotelinkList);
  res.end();
};
