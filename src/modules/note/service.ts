import * as Helper from "./helper";

export const updateNote = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const note: any = await Helper.updateNote(
    req.params.space,
    req.query.reload,
    req.body,
    userId
  );
  res.status(200);
  res.send(note);
  res.end();
};

export const createNote = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const note: any = await Helper.createNote(
    req.params.space,
    req.query.reload,
    req.body,
    userId
  );
  res.status(200);
  res.send(note);
  res.end();
};

export const getNote = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const noteList: any = await Helper.getNote(req.params.space);
  res.status(200);
  res.send(noteList);
  res.end();
};

export const getNoteDictionary = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const noteList: any = await Helper.getNoteDictionary(req.params.space);
  res.status(200);
  res.send(noteList);
  res.end();
};

export const getRecentlyCreatedNote = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const noteList: any = await Helper.getRecentlyCreatedNote(req.params.space);
  res.status(200);
  res.send(noteList);
  res.end();
};

export const getNoteById = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const note: any = await Helper.getNoteById(req.params.space, req.params.id);
  res.status(200);
  res.send(note);
  res.end();
};

export const getNoteByReference = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const note: any = await Helper.getNoteByReference(
    req.params.space,
    req.params.reference
  );
  res.status(200);
  res.send(note);
  res.end();
};

export const searchNote = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const note: any = await Helper.searchNote(
    req.params.space,
    req.body.text,
    req.body.textList,
    req.body.searchPref
  );
  res.status(200);
  res.send(note);
  res.end();
};

export const getNotesByMetadataValue = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const note: any = await Helper.getNotesByMetadataValue(
    req.params.space,
    req.params.metadataId,
    req.body
  );
  res.status(200);
  res.send(note);
  res.end();
};

export const browseNotes = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const note: any = await Helper.browseNotes(req.params.space, req.body);
  res.status(200);
  res.send(note);
  res.end();
};

export const deleteNote = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.deleteNote(req.params.space, req.params.id);
  res.status(200);
  res.send(outcome);
  res.end();
};

export const deleteNoteByReference = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.deleteNoteByReference(
    req.params.space,
    req.params.reference
  );
  res.status(200);
  res.send(outcome);
  res.end();
};

export const deleteNoteByReferenceList = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.deleteNoteByReferenceList(
    req.params.space,
    req.body
  );
  res.status(200);
  res.send(outcome);
  res.end();
};

export const brainstormUsingAi = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const text: any = await Helper.brainstormUsingAi(req.params.space, req.body);
  res.status(200);
  res.send({ text });
  res.end();
};
