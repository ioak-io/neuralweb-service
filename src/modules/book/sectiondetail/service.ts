import { finishGenerating, startGenerating } from "../log/helper";
import * as Helper from "./helper";

export const createDetail = async (req: any, res: any) => {
  const userId = req.user.user_id;

  await startGenerating(
    req.params.space,
    req.params.bookref,
    req.params.sectionref,
    req.body.type
  );

  await Helper.addSectionDetailPlaceholder(
    req.params.space,
    req.params.bookref,
    req.params.sectionref,
    req.body.type
  );

  res.status(202).send({
    message:
      "Section generation started. You will be notified upon completion.",
  });

  await Helper.createDetail(
    req.params.space,
    req.params.bookref,
    req.params.sectionref,
    req.body,
    userId
  );

  await finishGenerating(
    req.params.space,
    req.params.bookref,
    req.params.sectionref,
    req.body.type
  );
};

export const updateDetail = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const sectiondetail: any = await Helper.updateDetail(
    req.params.space,
    req.params.id,
    req.body,
    userId
  );
  res.status(200);
  res.send(sectiondetail);
  res.end();
};

export const getDetailsByBookReference = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const sectiondetail: any = await Helper.getDetailsByBookReference(
    req.params.space,
    req.params.bookref,
    req.params.sectionref
  );
  res.status(200);
  res.send(sectiondetail);
  res.end();
};

export const deleteDetail = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.deleteDetail(
    req.params.space,
    req.params.id
  );
  res.status(200);
  res.send(outcome);
  res.end();
};
