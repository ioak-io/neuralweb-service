const { gql, AuthenticationError } = require("apollo-server-express");
const { articleCommentSchema, articleCommentCollection } = require("./model");
const { articleSchema, articleCollection } = require("../model");
const { getCollection } = require("../../../lib/dbutils");

const typeDefs = gql`
  extend type Query {
    articleComments(
      articleId: String!
      pageSize: Int
      pageNo: Int
    ): ArticleCommentPaginated
    articleComment(id: ID!): ArticleComment
  }

  extend type Mutation {
    updateArticleComment(payload: ArticleCommentPayload!): ArticleComment
    markArticleCommentAsAnswer(id: ID!): ArticleComment
    unmarkArticleCommentAsAnswer(id: ID!): ArticleComment
  }

  type ArticleCommentPaginated {
    pageNo: Int
    hasMore: Boolean
    total: Int
    results: [ArticleComment]!
  }

  input ArticleCommentPayload {
    id: ID
    text: String
    parentId: String
    articleId: String!
  }

  type ArticleComment {
    id: ID!
    text: String
    parentId: String
    helpful: Int
    notHelpful: Int
    isAnswer: Boolean
    createdBy: String
    updatedBy: String
    createdAt: DateScalar
    updatedAt: DateScalar
  }

  extend type ArticleCommentFeedback {
    articleComment: ArticleComment
  }
`;

const resolvers = {
  Query: {
    articleComments: async (
      _,
      { articleId, pageSize = 0, pageNo = 0 },
      { asset, user }
    ) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(
        asset,
        articleCommentCollection,
        articleCommentSchema
      );
      const response = await model
        .find({ articleId: articleId })
        // .sort({ rootParentId: 1, parentId: 1, createdAt: 1 })
        .sort({ isAnswer: -1 })
        .sort({ createdAt: 1 })
        .skip(pageNo * pageSize)
        .limit(pageSize);
      return {
        results: response,
        pageNo: response.length === pageSize ? pageNo + 1 : pageNo,
        hasMore: response.length === pageSize ? true : false,
      };
    },
    articleComment: async (_, { id }, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(
        asset,
        articleCommentCollection,
        articleCommentSchema
      );
      return await model.findById(id);
    },
  },

  ArticleCommentFeedback: {
    articleComment: async (parent, _, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(
        asset,
        articleCommentCollection,
        articleCommentSchema
      );
      return await model.findById(parent.commentId);
    },
  },

  Mutation: {
    updateArticleComment: async (_, { payload }, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(
        asset,
        articleCommentCollection,
        articleCommentSchema
      );

      let id = payload.id;

      if (!payload.id) {
        const articleModel = getCollection(
          asset,
          articleCollection,
          articleSchema
        );
        await articleModel.findByIdAndUpdate(
          payload.articleId,
          { $inc: { comments: 1 } },
          { new: true }
        );
        const response = await new model({
          ...payload,
          createdBy: user.userId,
        }).save();
        id = response.id;
      }

      const parentFields = { parentId: payload.parentId || id };
      if (!payload.id) {
        const parentComment = await model.findById(payload.parentId);
        if (parentComment) {
          parentFields.rootParentId = parentComment.rootParentId;
        } else {
          parentFields.rootParentId = parentFields.parentId;
        }
      }

      return await model.findByIdAndUpdate(
        id,
        {
          ...payload,
          ...parentFields,
          updatedBy: user.userId,
        },
        {
          new: true,
        }
      );
    },
    markArticleCommentAsAnswer: async (_, { id }, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(
        asset,
        articleCommentCollection,
        articleCommentSchema
      );

      const response = await model.findByIdAndUpdate(
        id,
        {
          isAnswer: true,
          updatedBy: user.userId,
        },
        {
          new: true,
        }
      );

      await model.updateMany(
        { $and: [{ articleId: response.articleId }, { _id: { $ne: id } }] },
        {
          $set: {
            isAnswer: false,
          },
        },
        {
          new: true,
        }
      );

      const articleModel = getCollection(
        asset,
        articleCollection,
        articleSchema
      );
      await articleModel.findByIdAndUpdate(
        response.articleId,
        { isAnswered: true, answeredOn: new Date() },
        { new: true }
      );

      return response;
    },
    unmarkArticleCommentAsAnswer: async (_, { id }, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(
        asset,
        articleCommentCollection,
        articleCommentSchema
      );

      const response = await model.findByIdAndUpdate(
        id,
        {
          isAnswer: false,
          updatedBy: user.userId,
        },
        {
          new: true,
        }
      );

      const articleModel = getCollection(
        asset,
        articleCollection,
        articleSchema
      );
      await articleModel.findByIdAndUpdate(
        response.articleId,
        { isAnswered: false, answeredOn: null },
        { new: true }
      );

      return response;
    },
  },
};

module.exports = { typeDefs, resolvers };
