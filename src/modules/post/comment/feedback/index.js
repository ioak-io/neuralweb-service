const { gql, AuthenticationError } = require("apollo-server-express");
const {
  postCommentFeedbackSchema,
  postCommentFeedbackCollection,
} = require("./model");
const { postCommentSchema, postCommentCollection } = require("../model");
const { getCollection } = require("../../../../lib/dbutils");

const typeDefs = gql`
  extend type Query {
    postCommentFeedback(commentId: ID!): [PostCommentFeedback]
  }

  extend type Mutation {
    addPostCommentFeedback(
      commentId: String!
      type: String!
    ): PostCommentFeedback
    removePostCommentFeedback(
      commentId: String!
      type: String!
    ): PostCommentFeedback
  }

  type PostCommentFeedback {
    id: ID!
    type: String
  }

  extend type PostComment {
    feedback: [PostCommentFeedback]
  }
`;

const resolvers = {
  Query: {
    postCommentFeedback: async (_, { commentId }, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(
        asset,
        postCommentFeedbackCollection,
        postCommentFeedbackSchema
      );
      return await model.find({ commentId: commentId, userId: user.userId });
    },
  },

  PostComment: {
    feedback: {
      resolve: async (parent, _args, { asset, user }) => {
        if (!asset || !user) {
          return new AuthenticationError(
            "Not authorized to access this content"
          );
        }
        const model = getCollection(
          asset,
          postCommentFeedbackCollection,
          postCommentFeedbackSchema
        );
        return await model.find({ commentId: parent.id, userId: user.userId });
      },
    },
  },

  Mutation: {
    addPostCommentFeedback: async (_, args, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(
        asset,
        postCommentFeedbackCollection,
        postCommentFeedbackSchema
      );
      const response = await model.findOneAndUpdate(
        { commentId: args.commentId, userId: user.userId, type: args.type },
        { commentId: args.commentId, userId: user.userId, type: args.type },
        { upsert: true, new: true, rawResult: true }
      );
      if (!response.lastErrorObject.updatedExisting) {
        const postCommentModel = getCollection(
          asset,
          postCommentCollection,
          postCommentSchema
        );
        await postCommentModel.findByIdAndUpdate(
          args.commentId,
          {
            $inc: { [args.type]: 1 },
          },
          { new: true }
        );
      }
      return response.value;
    },
    removePostCommentFeedback: async (_, args, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(
        asset,
        postCommentFeedbackCollection,
        postCommentFeedbackSchema
      );
      const response = await model.findOneAndDelete(
        { commentId: args.commentId, userId: user.userId, type: args.type },
        {
          rawResult: true,
        }
      );
      if (response.lastErrorObject.n > 0) {
        const postCommentModel = getCollection(
          asset,
          postCommentCollection,
          postCommentSchema
        );
        await postCommentModel.findByIdAndUpdate(
          args.commentId,
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
