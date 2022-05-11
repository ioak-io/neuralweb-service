const { gql, AuthenticationError } = require("apollo-server-express");
const { postFollowerSchema, postFollowerCollection } = require("./model");
const { postSchema, postCollection } = require("./../model");
const { getCollection } = require("../../../lib/dbutils");

const typeDefs = gql`
  type PostFollower {
    id: ID!
    userId: String
    postId: String
  }

  extend type Post {
    followerList: [PostFollower]
  }

  extend type Mutation {
    followPost(postId: String!): PostFollower
    unfollowPost(postId: String!): PostFollower
  }
`;

const resolvers = {
  Post: {
    followerList: {
      resolve: async (parent, _args, { asset, user }, info) => {
        if (!asset || !user) {
          return new AuthenticationError(
            "Not authorized to access this content"
          );
        }
        const model = getCollection(
          asset,
          postFollowerCollection,
          postFollowerSchema
        );
        return await model.find({ postId: parent.id });
      },
    },
  },

  Mutation: {
    followPost: async (_, args, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(
        asset,
        postFollowerCollection,
        postFollowerSchema
      );
      const response = await model.findOneAndUpdate(
        { postId: args.postId, userId: user.userId },
        { postId: args.postId, userId: user.userId },
        { upsert: true, new: true, rawResult: true }
      );
      if (!response.lastErrorObject.updatedExisting) {
        const postModel = getCollection(asset, postCollection, postSchema);
        await postModel.findByIdAndUpdate(
          args.postId,
          {
            $inc: { followers: 1 },
          },
          { new: true }
        );
      }
      return response.value;
    },
    unfollowPost: async (_, args, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(
        asset,
        postFollowerCollection,
        postFollowerSchema
      );
      const response = await model.findOneAndDelete(
        { postId: args.postId, userId: user.userId },
        {
          rawResult: true,
        }
      );
      if (response.lastErrorObject.n > 0) {
        const postModel = getCollection(asset, postCollection, postSchema);
        await postModel.findByIdAndUpdate(
          args.postId,
          {
            $inc: { followers: -1 },
          },
          { new: true }
        );
      }
      return response.value;
    },
  },
};

module.exports = { typeDefs, resolvers };
