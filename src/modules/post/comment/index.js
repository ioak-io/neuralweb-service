const { gql, AuthenticationError } = require("apollo-server-express");
const { postCommentSchema, postCommentCollection } = require("./model");
const { postSchema, postCollection } = require("../model");
const { getCollection } = require("../../../lib/dbutils");

const typeDefs = gql`
  extend type Query {
    postComments(
      postId: String!
      pageSize: Int
      pageNo: Int
    ): PostCommentPaginated
    postComment(id: ID!): PostComment
  }

  extend type Mutation {
    updatePostComment(payload: PostCommentPayload!): PostComment
    markPostCommentAsAnswer(id: ID!): PostComment
    unmarkPostCommentAsAnswer(id: ID!): PostComment
  }

  type PostCommentPaginated {
    pageNo: Int
    hasMore: Boolean
    total: Int
    results: [PostComment]!
  }

  input PostCommentPayload {
    id: ID
    text: String
    parentId: String
    postId: String!
  }

  type PostComment {
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

  extend type PostCommentFeedback {
    postComment: PostComment
  }
`;

const resolvers = {
  Query: {
    postComments: async (
      _,
      { postId, pageSize = 0, pageNo = 0 },
      { asset, user }
    ) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(
        asset,
        postCommentCollection,
        postCommentSchema
      );
      const response = await model
        .find({ postId: postId })
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
    postComment: async (_, { id }, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(
        asset,
        postCommentCollection,
        postCommentSchema
      );
      return await model.findById(id);
    },
  },

  PostCommentFeedback: {
    postComment: async (parent, _, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(
        asset,
        postCommentCollection,
        postCommentSchema
      );
      return await model.findById(parent.commentId);
    },
  },

  Mutation: {
    updatePostComment: async (_, { payload }, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(
        asset,
        postCommentCollection,
        postCommentSchema
      );

      let id = payload.id;

      if (!payload.id) {
        const postModel = getCollection(asset, postCollection, postSchema);
        await postModel.findByIdAndUpdate(
          payload.postId,
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
    markPostCommentAsAnswer: async (_, { id }, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(
        asset,
        postCommentCollection,
        postCommentSchema
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
        { $and: [{ postId: response.postId }, { _id: { $ne: id } }] },
        {
          $set: {
            isAnswer: false,
          },
        },
        {
          new: true,
        }
      );

      const postModel = getCollection(asset, postCollection, postSchema);
      await postModel.findByIdAndUpdate(
        response.postId,
        { isAnswered: true, answeredOn: new Date() },
        { new: true }
      );

      return response;
    },
    unmarkPostCommentAsAnswer: async (_, { id }, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(
        asset,
        postCommentCollection,
        postCommentSchema
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

      const postModel = getCollection(asset, postCollection, postSchema);
      await postModel.findByIdAndUpdate(
        response.postId,
        { isAnswered: false, answeredOn: null },
        { new: true }
      );

      return response;
    },
  },
};

module.exports = { typeDefs, resolvers };
