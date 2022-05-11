import jwt from "jsonwebtoken";
import { gql, AuthenticationError } from "apollo-server-express";
import { userSchema, userCollection } from "./model";
import * as Helper from "./helper";
const { getCollection } = require("../../lib/dbutils");

const typeDefs = gql`
  type Query {
    user: [User]
    authorizeUser(
      accessToken: String
      refreshToken: String
      space: String
    ): AuthorizeResponse
  }

  type Mutation {
    createEmailAccount(payload: UserPayload): User!
  }

  input UserPayload {
    firstName: String!
    lastName: String!
    email: String!
  }

  type User {
    id: ID!
    given_name: String
    family_name: String
    name: String
    nickname: String
    email: String
    resolver: String
  }

  type AuthorizeResponse {
    accessToken: String
    claims: JSON
  }
`;

const resolvers = {
  Query: {
    user: async (_: any, { email }: any, { space, user }: any) => {
      if (!space || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(space, userCollection, userSchema);
      return await model.find();
    },
    authorizeUser: async (
      _: any,
      { accessToken, refreshToken, space }: any,
      __: any
    ) => {
      const model = getCollection(space, userCollection, userSchema);
      const accessTokenResponse = await Helper.decodeAccessToken(
        Number(space),
        accessToken
      );

      if (accessTokenResponse !== "expired") {
        return {
          accessToken: null,
          claims: accessTokenResponse,
        };
      }

      const newAccessToken = await Helper.getNewAccessToken(
        space,
        refreshToken
      );

      if (newAccessToken?.access_token) {
        const newAccessTokenResponse = await Helper.decodeAccessToken(
          space,
          newAccessToken.access_token
        );

        return {
          accessToken: newAccessToken.access_token,
          claims: newAccessTokenResponse,
        };
      }

      return null;
      // const response = await model.findOneAndUpdate(
      //   { email: args.payload.email, resolver: "email" },
      //   { ...args.payload, resolver: "email" },
      //   { upsert: true, new: true, rawResult: true }
      // );
      // return response.value;
    },
  },

  Mutation: {
    createEmailAccount: async (_: any, args: any, { space, user }: any) => {
      const model = getCollection(space, userCollection, userSchema);
      const response = await model.findOneAndUpdate(
        { email: args.payload.email, resolver: "email" },
        { ...args.payload, resolver: "email" },
        { upsert: true, new: true, rawResult: true }
      );
      return response.value;
    },
  },
};

export { typeDefs, resolvers };
