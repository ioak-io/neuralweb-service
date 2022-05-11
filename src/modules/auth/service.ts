import bcrypt from "bcrypt";
import { validateMandatoryFields } from "../../lib/validation";

import { userSchema, userCollection } from "../user/model";
import * as Helper from "./helper";
import { getCollection } from "../../lib/dbutils";

const selfRealm = 100;

export const signin = async (req: any, res: any, next: any) => {
  const payload = req.body;
  if (
    !validateMandatoryFields(res, payload, [
      "email",
      "password",
      "realm",
      "response_type",
    ])
  ) {
    return;
  }
  const model = getCollection(payload.realm, userCollection, userSchema);
  const user: any = await model.findOne({
    email: payload.email,
    type: "oneauth",
  });
  if (!user) {
    res.status(404);
    res.send({ error: { message: "User with this user name does not exist" } });
    res.end();
    return;
  }
  if (!user.email_verified) {
    res.status(403);
    res.send({ error: { message: "Email of user not verified" } });
    res.end();
    return;
  }

  const outcome = await bcrypt.compare(payload.password, user.hash);
  if (!outcome) {
    res.status(401);
    res.send({ error: { message: "Incorrect password" } });
    res.end();
    return;
  }

  const { session_id, refresh_token } = await Helper.createSession(
    payload.realm,
    user
  );

  if (payload.response_type === "code") {
    res.status(200);
    res.send({ session_id });
    res.end();
    return;
  }
  res.status(200);
  const access_token = await Helper.getAccessToken(refresh_token);
  res.send({ token_type: "Bearer", access_token, refresh_token });
  res.end();
};

export const issueToken = async (req: any, res: any, next: any) => {
  const payload = req.body;
  if (
    !validateMandatoryFields(res, payload, [
      "grant_type",
      "realm",
      "refresh_token",
    ])
  ) {
    return;
  }

  if (payload.grant_type === "refresh_token") {
    const access_token = await Helper.getAccessToken(payload.refresh_token);
    if (!access_token) {
      res.status(400);
      res.send({ error: { message: "Refresh token invalid or expired" } });
      res.end();
      return;
    }
    res.status(200);
    res.send({ token_type: "Bearer", access_token });
    res.end();
    return;
  }

  const token = req.params.token;
  const outcome = await Helper.decodeToken(token);
  res.status(200);
  res.send(outcome);
  res.end();
};

export const logout = async (req: any, res: any, next: any) => {
  const payload = req.body;
  if (!validateMandatoryFields(res, payload, ["realm", "refresh_token"])) {
    return;
  }
  const outcome = await Helper.deleteSessionByRefreshToken(
    payload.realm,
    payload.refresh_token
  );
  if (outcome.deletedCount === 0) {
    res.status(404);
    res.send({ error: { message: "Invalid session" } });
    res.end();
    return;
  }
  res.status(200);
  res.send({ refresh_token: payload.refresh_token });
  res.end();
};

export const validateSession = async (
  realmId: number,
  req: any,
  res: any,
  next: any
) => {
  try {
    const session: any = await Helper.validateSession(realmId, req.params.id);
    if (!session) {
      res.status(404);
      res.send("Session not found");
      res.end();
      return;
    }
    res.status(200);
    res.send({ sessionId: req.params.id, token: session.token });
    res.end();
  } catch (err) {
    next(err);
  }
};

export const deleteSession = async (
  realmId: number,
  req: any,
  res: any,
  next: any
) => {
  const outcome = await Helper.deleteSession(selfRealm, req.params.id);
  if (outcome.deletedCount === 0) {
    res.status(404);
    res.send("Session not found");
    res.end();
    return;
  }
  res.status(200);
  res.send({ sessionId: req.params.id });
  res.end();
};

export const decodeToken = async (req: any, res: any, next: any) => {
  res.status(200);
  res.send({ ...req.user });
  res.end();
};

export const decodeSession = async (
  realmId: number,
  req: any,
  res: any,
  next: any
) => {
  try {
    const outcome = await Helper.decodeSession(selfRealm, req.params.id);
    if (!outcome) {
      res.status(404);
      res.send("Session not found");
      res.end();
      return;
    }
    res.status(200);
    res.send(outcome);
    res.end();
  } catch (err) {
    next(err);
  }
};
