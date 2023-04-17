import * as Helper from "./helper";

const selfRealm = 100;

export const toggleStopword = async (req: any, res: any) => {
  const stopwords: any = await Helper.toggleStopword(req.params.space, req.body);
  res.status(200);
  res.send(stopwords);
  res.end();
};

export const resetStopwords = async (req: any, res: any) => {
  const stopwords: any = await Helper.resetStopwords(req.params.space);
  res.status(200);
  res.send(stopwords);
  res.end();
};

export const deleteStopword = async (req: any, res: any) => {
  const response: any = await Helper.deleteStopword(req.params.space, req.params.id);
  res.status(200);
  res.send(response);
  res.end();
};


export const getStopwords = async (req: any, res: any) => {
  const stopwords: any = await Helper.getStopwords(req.params.space);
  res.status(200);
  res.send(stopwords);
  res.end();
};
