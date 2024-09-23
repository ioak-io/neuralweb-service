import { finishGenerating, startGenerating } from "../log/helper";
import * as Helper from "./helper";

export const getLog = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const response: any = await Helper.getLog(
    req.params.space,
    req.params.bookref,
    req.params.sectionref,
    req.params.sectiontype
  );
  res.status(200);
  res.send(response);
  res.end();
};
