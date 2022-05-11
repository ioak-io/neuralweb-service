const { gql, AuthenticationError } = require("apollo-server-express");
const {
  articleCommentFeedbackSchema,
  articleCommentFeedbackCollection,
} = require("./model");
const { articleCommentSchema, articleCommentCollection } = require("../model");
const { getCollection } = require("../../../../lib/dbutils");

const typeDefs = gql`
  extend type Query {
    articleCommentFeedback(commentId: ID!): [ArticleCommentFeedback]
  }

  extend type Mutation {
    addArticleCommentFeedback(
      commentId: String!
      type: String!
    ): ArticleCommentFeedback
    removeArticleCommentFeedback(
      commentId: String!
      type: String!
    ): ArticleCommentFeedback
  }

  type ArticleCommentFeedback {
    id: ID!
    type: String
  }

  extend type ArticleComment {
    feedback: [ArticleCommentFeedback]
  }
`;

const resolvers = {
  Query: {
    articleCommentFeedback: async (_, { commentId }, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(
        asset,
        articleCommentFeedbackCollection,
        articleCommentFeedbackSchema
      );
      return await model.find({ commentId: commentId, userId: user.userId });
    },
  },

  ArticleComment: {
    feedback: {
      resolve: async (parent, _args, { asset, user }) => {
        if (!asset || !user) {
          return new AuthenticationError(
            "Not authorized to access this content"
          );
        }
        const model = getCollection(
          asset,
          articleCommentFeedbackCollection,
          articleCommentFeedbackSchema
        );
        return await model.find({ commentId: parent.id, userId: user.userId });
      },
    },
  },

  Mutation: {
    addArticleCommentFeedback: async (_, args, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(
        asset,
        articleCommentFeedbackCollection,
        articleCommentFeedbackSchema
      );
      const response = await model.findOneAndUpdate(
        { commentId: args.commentId, userId: user.userId, type: args.type },
        { commentId: args.commentId, userId: user.userId, type: args.type },
        { upsert: true, new: true, rawResult: true }
      );
      if (!response.lastErrorObject.updatedExisting) {
        const articleCommentModel = getCollection(
          asset,
          articleCommentCollection,
          articleCommentSchema
        );
        await articleCommentModel.findByIdAndUpdate(
          args.commentId,
          {
            $inc: { [args.type]: 1 },
          },
          { new: true }
        );
      }
      return response.value;
    },
    removeArticleCommentFeedback: async (_, args, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(
        asset,
        articleCommentFeedbackCollection,
        articleCommentFeedbackSchema
      );
      const response = await model.findOneAndDelete(
        { commentId: args.commentId, userId: user.userId, type: args.type },
        {
          rawResult: true,
        }
      );
      if (response.lastErrorObject.n > 0) {
        const articleCommentModel = getCollection(
          asset,
          articleCommentCollection,
          articleCommentSchema
        );
        await articleCommentModel.findByIdAndUpdate(
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
