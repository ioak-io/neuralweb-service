import jwt from "jsonwebtoken";
import { gql, AuthenticationError } from "apollo-server-express";
import { sessionSchema, sessionCollection } from "./model";
import { userSchema, userCollection } from "../user/model";
const { getCollection } = require("../../lib/dbutils");
import { v4 as uuidv4 } from "uuid";

const axios = require("axios");

const ONEAUTH_API = process.env.ONEAUTH_API || "http://127.0.0.1:8020";

const typeDefs = gql`
  extend type Query {
    session(id: ID!, space: String): UserSession
  }

  type Session {
    id: ID!
    sessionId: String!
    token: String!
  }

  type UserSession {
    id: ID!
    firstName: String
    lastName: String
    email: String
    token: String
  }
`;

const oaSession = async (space: string, id: string) => {
  try {
    const response = await axios.get(
      `${ONEAUTH_API}/auth/space/${space}/session/${id}`
    );

    if (response.status === 200) {
      const user: any = jwt.verify(response.data.token, "jwtsecret");
      const model = getCollection(space, userCollection, userSchema);
      const data = await model.findByIdAndUpdate(
        user.userId,
        { ...user, resolver: "oneauth_space" },
        { new: true, upsert: true }
      );
      if (data) {
        return {
          id: data._id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          token: response.data.token,
        };
      } else {
        return null;
      }
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

const emailOrExternSession = async (space: string, sessionId: string) => {
  const model = getCollection(space, sessionCollection, sessionSchema);
  const session = await model.findOne({ sessionId });
  if (!session) {
    return null;
  }

  const data: any = await jwt.verify(session.token, "jwtsecret");

  if (!data) {
    return null;
  }

  return {
    id: data.userId,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    token: session.token,
  };
};

const resolvers = {
  Query: {
    session: async (_: any, { id, space }: any) => {
      return await oaSession(space, id);
    },
  },
};

export { typeDefs, resolvers };
