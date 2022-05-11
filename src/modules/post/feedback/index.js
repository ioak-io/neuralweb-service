const { gql, AuthenticationError } = require("apollo-server-express");
const { postFeedbackSchema, postFeedbackCollection } = require("./model");
const { postSchema, postCollection } = require("../model");
const { getCollection } = require("../../../lib/dbutils");

const typeDefs = gql`
  extend type Query {
    postFeedback(postId: ID!): [PostFeedback]
  }

  extend type Mutation {
    addPostFeedback(postId: String!, type: String!): PostFeedback
    removePostFeedback(postId: String!, type: String!): PostFeedback
  }

  type PostFeedback {
    id: ID!
    type: String
  }

  extend type Post {
    feedback: [PostFeedback]
  }
`;

const resolvers = {
  Query: {
    postFeedback: async (_, { postId }, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(
        asset,
        postFeedbackCollection,
        postFeedbackSchema
      );
      return await model.find({ postId: postId, userId: user.userId });
    },
  },

  Post: {
    feedback: {
      resolve: async (parent, _args, { asset, user }) => {
        if (!asset || !user) {
          return new AuthenticationError(
            "Not authorized to access this content"
          );
        }
        const model = getCollection(
          asset,
          postFeedbackCollection,
          postFeedbackSchema
        );
        return await model.find({ postId: parent.id, userId: user.userId });
      },
    },
  },

  Mutation: {
    addPostFeedback: async (_, args, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(
        asset,
        postFeedbackCollection,
        postFeedbackSchema
      );
      const response = await model.findOneAndUpdate(
        { postId: args.postId, userId: user.userId, type: args.type },
        { postId: args.postId, userId: user.userId, type: args.type },
        { upsert: true, new: true, rawResult: true }
      );
      if (!response.lastErrorObject.updatedExisting) {
        const postModel = getCollection(asset, postCollection, postSchema);
        await postModel.findByIdAndUpdate(
          args.postId,
          {
            $inc: { [args.type]: 1 },
          },
          { new: true }
        );
      }
      return response.value;
    },
    removePostFeedback: async (_, args, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(
        asset,
        postFeedbackCollection,
        postFeedbackSchema
      );
      const response = await model.findOneAndDelete(
        { postId: args.postId, userId: user.userId, type: args.type },
        {
          rawResult: true,
        }
      );
      if (response.lastErrorObject.n > 0) {
        const postModel = getCollection(asset, postCollection, postSchema);
        await postModel.findByIdAndUpdate(
          args.postId,
          {
            $inc: { [args.type]: -1 },
          },
          { new: true }
        );
      }
      return response.value;
    },
  },
};

module.exports = { typeDefs, resolvers };
