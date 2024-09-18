import * as Helper from "./helper";

export const createThemeDetail = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const themeDetail: any = await Helper.createThemeDetail(
    req.params.space,
    req.params.bookref,
    req.params.conceptref,
    req.params.themeref,
    req.body,
    userId
  );
  res.status(200);
  res.send(themeDetail);
  res.end();
};

export const updateThemeDetail = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const themeDetail: any = await Helper.updateThemeDetail(
    req.params.space,
    req.params.id,
    req.body,
    userId
  );
  res.status(200);
  res.send(themeDetail);
  res.end();
};

export const getThemeDetailsByBookReference = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const themeDetail: any = await Helper.getThemeDetailsByBookReference(
    req.params.space,
    req.params.bookref,
    req.params.conceptref,
    req.params.themeref
  );
  res.status(200);
  res.send(themeDetail);
  res.end();
};

export const getThemeDetailsByBookReferenceShortform = async (
  req: any,
  res: any
) => {
  const userId = req.user.user_id;
  const themeDetail: any =
    await Helper.getThemeDetailsByBookReferenceShortform(
      req.params.space,
      req.params.bookref
    );
  res.status(200);
  res.send(themeDetail);
  res.end();
};

export const deleteThemeDetail = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.deleteThemeDetail(
    req.params.space,
    req.params.id
  );
  res.status(200);
  res.send(outcome);
  res.end();
};
