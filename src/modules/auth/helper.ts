import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import jwt from "jsonwebtoken";
import { add, addDays, differenceInSeconds } from "date-fns";

import { sessionSchema, sessionCollection } from "../session/model";
import { getCollection } from "../../lib/dbutils";
import { userCollection, userSchema } from "../user/model";

const selfRealm = 100;
const appUrl = process.env.APP_URL || "http://localhost:3010";

export const createSession = async (realm: number, user: any) => {
  const session_id = uuidv4();
  const model = getCollection(String(realm), sessionCollection, sessionSchema);
  const claims = {
    user_id: user.id,
    given_name: user.given_name,
    family_name: user.family_name,
    name: user.name,
    nickname: user.nickname,
    email: user.email,
    type: user.type,
  };
  const appRoot = process.cwd();
  const privateKey = fs.readFileSync(appRoot + "/private.pem");
  const refresh_token = jwt.sign(
    {
      realm,
      id: session_id,
    },
    { key: privateKey, passphrase: "no1knowsme" },
    {
      algorithm: "RS256",
      expiresIn: "8h",
    }
  );

  await model.create({
    session_id,
    refresh_token,
    user_id: user.id,
    claims,
    iat: new Date(),
    eat: add(new Date(), { hours: 8 }),
  });
  return { session_id, refresh_token };
};

export const getAccessToken = async (refreshToken: string) => {
  const decoded: any = await decodeToken(refreshToken);
  if (
    !decoded.outcome ||
    !decoded.claims ||
    !decoded.claims.realm ||
    !decoded.claims.id
  ) {
    return null;
  }
  const claims: any = decoded.claims;
  const appRoot = process.cwd();
  const privateKey = fs.readFileSync(appRoot + "/private.pem");
  const model = getCollection(claims.realm, sessionCollection, sessionSchema);
  const session = await model.findOne({ session_id: claims.id });
  if (differenceInSeconds(session.eat, new Date()) < 60) {
    return null;
  }

  const refreshTokenDuration =
    differenceInSeconds(session.eat, new Date()) > 60 * 60 * 2
      ? 60 * 60 * 2
      : differenceInSeconds(session.eat, new Date());
  const access_token = jwt.sign(
    session.claims,
    { key: privateKey, passphrase: "no1knowsme" },
    {
      algorithm: "RS256",
      expiresIn: `${refreshTokenDuration}s`,
    }
  );
  return access_token;
};

export const validateSession = async (realm: number, sessionId: string) => {
  const model = getCollection(String(realm), sessionCollection, sessionSchema);
  const session = await model.findOne({ sessionId });
  return session;
};

export const deleteSession = async (realm: number, session_id: string) => {
  const model = getCollection(String(realm), sessionCollection, sessionSchema);
  return await model.deleteOne({ session_id });
};

export const deleteSessionByRefreshToken = async (
  realm: number,
  refresh_token: string
) => {
  const model = getCollection(String(realm), sessionCollection, sessionSchema);
  return await model.deleteOne({ refresh_token });
};

export const decodeToken = async (token: string) => {
  const appRoot = process.cwd();
  const publicKey = fs.readFileSync(appRoot + "/public.pem");
  try {
    const res = await jwt.verify(token, publicKey);
    return { outcome: true, token, claims: res };
  } catch (err) {
    console.log(err);
    return { outcome: false, err };
  }
};

export const decodeSession = async (realmId: number, sessionId: string) => {
  const session: any = await validateSession(realmId, sessionId);
  if (!session) {
    return session;
  }
  return decodeToken(session.token);
};

export const getHash = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const encodeAppToken = (claims: any) => {
  const appRoot = process.cwd();
  const privateKey = fs.readFileSync(appRoot + "/local_private.pem");
  const token = jwt.sign(
    claims,
    { key: privateKey, passphrase: "fevicryl" },
    {
      algorithm: "RS256",
      expiresIn: "100h",
    }
  );
  return token;
};

export const decodeAppToken = async (token: string) => {
  const appRoot = process.cwd();
  const publicKey = fs.readFileSync(appRoot + "/local_public.pem");
  try {
    const res = await jwt.verify(token, publicKey);
    return { outcome: true, token, claims: res };
  } catch (err) {
    console.log(err);
    return { outcome: false, err };
  }
};
