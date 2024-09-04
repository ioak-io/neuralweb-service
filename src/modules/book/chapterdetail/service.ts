import * as Helper from "./helper";

export const createChapterDetail = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const chapterDetail: any = await Helper.createChapterDetail(
    req.params.space,
    req.params.bookref,
    req.params.chapterref,
    req.body,
    userId
  );
  res.status(200);
  res.send(chapterDetail);
  res.end();
};

export const updateChapterDetail = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const chapterDetail: any = await Helper.updateChapterDetail(
    req.params.space,
    req.query.reload,
    req.body,
    userId
  );
  res.status(200);
  res.send(chapterDetail);
  res.end();
};

export const getChapterDetailsByBookReference = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const chapterDetail: any = await Helper.getChapterDetailsByBookReference(
    req.params.space,
    req.params.bookref,
    req.params.chapterref
  );
  res.status(200);
  res.send(chapterDetail);
  res.end();
};

export const deleteChapterDetail = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.deleteChapterDetail(
    req.params.space,
    req.params.id
  );
  res.status(200);
  res.send(outcome);
  res.end();
};
