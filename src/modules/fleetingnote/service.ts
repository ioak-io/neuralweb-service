import bcrypt from "bcrypt";
import { validateMandatoryFields } from "../../lib/validation";

import { userSchema, userCollection } from "../user/model";
import * as Helper from "./helper";
import { getCollection } from "../../lib/dbutils";

const selfRealm = 100;

export const updateFleetingnote = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const fleetingnote: any = await Helper.updateFleetingnote(req.params.space, req.query.reload, req.body, userId);
  res.status(200);
  res.send(fleetingnote);
  res.end();
};

export const getFleetingnote = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const fleetingnoteList: any = await Helper.getFleetingnote(req.params.space);
  res.status(200);
  res.send(fleetingnoteList);
  res.end();
};

export const getFleetingnoteDictionary = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const fleetingnoteList: any = await Helper.getFleetingnoteDictionary(req.params.space);
  res.status(200);
  res.send(fleetingnoteList);
  res.end();
};

export const getFleetingnotes = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const fleetingnoteList: any = await Helper.getFleetingnotes(req.params.space);
  res.status(200);
  res.send(fleetingnoteList);
  res.end();
};

export const getRecentlyCreatedFleetingnote = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const fleetingnoteList: any = await Helper.getRecentlyCreatedFleetingnote(req.params.space);
  res.status(200);
  res.send(fleetingnoteList);
  res.end();
};

export const getFleetingnoteById = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const fleetingnote: any = await Helper.getFleetingnoteById(req.params.space, req.params.id);
  res.status(200);
  res.send(fleetingnote);
  res.end();
};

export const getFleetingnoteByReference = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const fleetingnote: any = await Helper.getFleetingnoteByReference(
    req.params.space,
    req.params.reference
  );
  res.status(200);
  res.send(fleetingnote);
  res.end();
};

export const searchFleetingnote = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const fleetingnote: any = await Helper.searchFleetingnote(req.params.space, req.body.text, req.body.textList, req.body.searchPref);
  res.status(200);
  res.send(fleetingnote);
  res.end();
};

export const getFleetingnotesByMetadataValue = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const fleetingnote: any = await Helper.getFleetingnotesByMetadataValue(req.params.space, req.params.metadataId, req.body);
  res.status(200);
  res.send(fleetingnote);
  res.end();
};

export const deleteFleetingnote = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.deleteFleetingnote(req.params.space, req.params.id);
  res.status(200);
  res.send(outcome);
  res.end();
};


export const deleteFleetingnoteByReference = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const outcome: any = await Helper.deleteFleetingnoteByReference(req.params.space, req.params.reference);
  res.status(200);
  res.send(outcome);
  res.end();
};
