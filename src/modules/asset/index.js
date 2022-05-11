const { gql } = require("apollo-server-express");
const { assetCollection, assetSchema } = require("./model");
const { getGlobalCollection } = require("../../lib/dbutils");
const { isUnauthorized } = require("../../lib/authutils");
const { nextval } = require("../sequence/service");

const typeDefs = gql`
  extend type Query {
    asset(assetId: String!): Asset
    assetById(id: ID!): Asset
    assets: [Asset]
  }

  extend type Mutation {
    updateAsset(payload: AssetPayload): Asset
    createAsset(payload: AssetPayload, addition: AssetAdditionPayload): Asset
  }

  input AssetPayload {
    id: String
    name: String
    section: JSON
    featuredTitle: String
    featuredSubtitle: String
    hero: JSON
    jwtPassword: String
    productionMode: Boolean
  }

  input AssetAdditionPayload {
    email: String
  }

  type Asset {
    id: ID!
    name: String
    section: JSON
    featuredTitle: String
    featuredSubtitle: String
    hero: JSON
    jwtPassword: String
    productionMode: Boolean
    assetId: String
  }
`;

const resolvers = {
  Query: {
    asset: async (_, { assetId }, { user }) => {
      // if (!user) {
      //   return new AuthenticationError('Not authorized to access this content');
      // }
      const model = getGlobalCollection(assetCollection, assetSchema);
      return await model.findOne({ assetId });
    },
    assets: async () => {
      // if (!user) {
      //   return new AuthenticationError('Not authorized to access this content');
      // }
      const model = getGlobalCollection(assetCollection, assetSchema);
      return await model.find();
    },
  },

  Mutation: {
    updateAsset: async (_, args, { user }) => {
      const model = getGlobalCollection(assetCollection, assetSchema);
      if (args.payload.id) {
        return await model.findByIdAndUpdate(args.payload.id, args.payload, {
          new: true,
        });
      } else if (args.payload.assetId) {
        return await model.findOneAndUpdate(
          { assetId: args.payload.assetId },
          args.payload,
          {
            new: true,
          }
        );
      } else {
        const data = new model({
          ...args.payload,
          assetId: `a${await nextval("assetId")}`,
        });
        return await data.save();
      }
    },
    createAsset: async (_, { payload, addition }, { user }) => {
      const model = getGlobalCollection(assetCollection, assetSchema);
      const data = new model({
        ...payload,
        assetId: `a${await nextval("assetId")}`,
      });
      console.log(
        `user account needs to be setup for ${addition.email} in ${payload.name}`
      );
      return await data.save();
    },
  },
};

module.exports = { typeDefs, resolvers };
