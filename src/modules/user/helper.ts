const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
import { userSchema, userCollection } from "./model";
import { userInviteCollection, userInviteSchema } from "../user/invite/model";
import * as Helper from "./helper";
import { getGlobalCollection } from "../../lib/dbutils";
import { decodeAppToken } from "../auth/helper";
import { getLocalTokenImpl } from "./service";

export const decodeAccessToken = async (space: number, accessToken: string) => {
  let decodedResponse = null;
  try {
    decodedResponse = await axios.get(`${ONEAUTH_API}/auth/token/decode`, {
      headers: {
        authorization: accessToken,
      },
    });
  } catch (err: any) {
    if (err.response.status === 401) {
      return "expired";
    }
    return "expired";
  }

  if (decodedResponse.status === 200) {
    const model = getGlobalCollection(userCollection, userSchema);
    const existingUserRecord = await model.find({
      email: decodedResponse.data.email,
    });
    const data = await model.findByIdAndUpdate(
      decodedResponse.data.user_id,
      {
        ...decodedResponse.data,
        resolver: "oneauth_space",
      },
      { new: true, upsert: true }
    );

    if (existingUserRecord.length === 0) {
      await autoAcceptInvites(data);
    }

    return decodedResponse.data || null;
  }

  return null;
};

const autoAcceptInvites = async (user: any) => {
  const model = getGlobalCollection(userInviteCollection, userInviteSchema);
  const pendingInviteList = await model.find({ email: user.email });
  console.log(pendingInviteList);
  for (let i = 0; i < pendingInviteList.length; i++) {
    const res = await model.findByIdAndUpdate(
      pendingInviteList[i]._id,
      {
        ...pendingInviteList[i]._doc,
        userId: user._id,
        accepted: true,
      },
      { new: true, upsert: true }
    );

    console.log({
      ...pendingInviteList[i],
      userId: user._id,
      accepted: true,
    });
  }
};

export const getNewAccessToken = async (
  space: number,
  refreshToken: string
) => {
  const refreshTokenResponse = await axios.post(`${ONEAUTH_API}/auth/token`, {
    grant_type: "refresh_token",
    realm: space,
    refresh_token: refreshToken,
  });

  if (refreshTokenResponse.status === 200) {
    return refreshTokenResponse.data;
  }

  return null;
};

export const validateSession = async (
  localAccessToken: string,
  refreshToken: string,
  appRealm: any
) => {
  const model = getGlobalCollection(userCollection, userSchema);

  const localTokenResponse = await decodeAppToken(localAccessToken);
  let accessToken: string = "";
  let localClaims: any = {};
  if (!localTokenResponse.outcome) {
    return null;
  }
  const {
    accessToken: _accessToken,
    ..._localClaims
  }: any = localTokenResponse.claims;
  accessToken = _accessToken;
  localClaims = {
    space: _localClaims.space,
    companyId: _localClaims.companyId,
  };

  const accessTokenResponse = await Helper.decodeAccessToken(
    Number(appRealm),
    accessToken
  );

  if (accessTokenResponse !== "expired") {
    return {
      accessToken: null,
      claims: accessTokenResponse,
      space: localClaims.space,
    };
  }

  const newAccessToken = await Helper.getNewAccessToken(appRealm, refreshToken);

  if (newAccessToken?.access_token) {
    const newAccessTokenResponse = await Helper.decodeAccessToken(
      appRealm,
      newAccessToken.access_token
    );

    return {
      accessToken: await getLocalTokenImpl(
        newAccessTokenResponse.user_id,
        newAccessToken.access_token
      ),
      claims: newAccessTokenResponse,
      space: localClaims.space,
    };
  }

  return null;
  // const response = await model.findOneAndUpdate(
  //   { email: args.payload.email, resolver: "email" },
  //   { ...args.payload, resolver: "email" },
  //   { upsert: true, new: true, rawResult: true }
  // );
  // return response.value;
};

export const getUsers = async () => {
  const model = getGlobalCollection(userCollection, userSchema);

  return await model.find();
};

export const getUserByEmail = async (email: string) => {
  const model = getGlobalCollection(userCollection, userSchema);

  return await model.findOne({ email: email.toLowerCase() });
};

export const getUserById = async (id: string) => {
  const model = getGlobalCollection(userCollection, userSchema);

  return await model.findById(id);
};
