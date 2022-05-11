const { gql, AuthenticationError } = require("apollo-server-express");
const { GraphQLScalarType } = require("graphql");
const { postSchema, postCollection } = require("./model");
const { postTagSchema, postTagCollection } = require("./tag/model");
const {
  postFollowerSchema,
  postFollowerCollection,
} = require("./follower/model");
const { getCollection } = require("../../lib/dbutils");

const typeDefs = gql`
  extend type Query {
    post(id: ID!): Post
    posts(pageSize: Int, pageNo: Int): PostPaginated
    searchPosts(text: String, pageSize: Int, pageNo: Int): PostPaginated
    myPosts(pageSize: Int, pageNo: Int): PostPaginated
  }

  extend type Mutation {
    addPost(payload: PostPayload): Post
    deletePost(id: ID!): Post
  }

  input PostPayload {
    id: String
    title: String
    description: String
    addTags: [String]
    removeTags: [String]
  }

  type PostPaginated {
    pageNo: Int
    hasMore: Boolean
    total: Int
    results: [Post]!
  }

  type Post {
    id: ID!
    title: String
    description: String
    views: Int!
    comments: Int!
    isAnswered: Boolean!
    answeredOn: DateScalar
    followers: Int!
    helpful: Int!
    notHelpful: Int!
    createdAt: DateScalar
    updatedAt: DateScalar
    createdBy: String
    updatedBy: String
  }

  extend type PostFeedback {
    post: Post
  }
  extend type PostTag {
    post: Post
  }
  extend type PostFollower {
    post: Post
  }
  extend type PostComment {
    post: Post
  }
`;

const resolvers = {
  Query: {
    post: async (_, { id }, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(asset, postCollection, postSchema);
      response = await model.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { new: true }
      );
      return response;
    },
    posts: async (_, { pageSize = 0, pageNo = 0 }, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(asset, postCollection, postSchema);
      const response = await model
        .find({})
        .skip(pageNo * pageSize)
        .limit(pageSize);
      return {
        results: response,
        pageNo: response.length === pageSize ? pageNo + 1 : pageNo,
        hasMore: response.length === pageSize ? true : false,
      };
    },
    searchPosts: async (
      _,
      { text, pageSize = 0, pageNo = 0 },
      { asset, user }
    ) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      if (!text) {
        return {
          results: [],
          pageNo: 0,
          hasMore: false,
          total: 0,
        };
      }
      const model = getCollection(asset, postCollection, postSchema);
      const res = await model
        .find({
          $or: [
            { description: { $regex: new RegExp(text, "ig") } },
            { title: { $regex: new RegExp(text, "ig") } },
          ],
        })
        .skip(pageNo * pageSize)
        .limit(pageSize);

      return {
        results: res,
        pageNo: res.length === pageSize ? pageNo + 1 : pageNo,
        hasMore: res.length === pageSize ? true : false,
      };
    },
    myPosts: async (_, { pageSize = 0, pageNo = 0 }, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(asset, postCollection, postSchema);
      const res = await model
        .find({
          createdBy: user.userId,
        })
        .skip(pageNo * pageSize)
        .limit(pageSize);

      return {
        results: res,
        pageNo: res.length === pageSize ? pageNo + 1 : pageNo,
        hasMore: res.length === pageSize ? true : false,
      };
    },
  },

  PostFeedback: {
    post: async (parent, _, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(asset, postCollection, postSchema);
      return await model.findById(parent.postId);
    },
  },

  PostTag: {
    post: async (parent, _, { asset, user }) => {
      const model = getCollection(asset, postCollection, postSchema);
      return await model.findById(parent.postId);
    },
  },

  PostFollower: {
    post: async (parent, _, { asset, user }) => {
      const model = getCollection(asset, postCollection, postSchema);
      return await model.findById(parent.postId);
    },
  },

  PostComment: {
    post: async (parent, _, { asset, user }) => {
      const model = getCollection(asset, postCollection, postSchema);
      return await model.findById(parent.postId);
    },
  },

  Mutation: {
    addPost: async (_, args, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(asset, postCollection, postSchema);
      const tagModel = getCollection(asset, postTagCollection, postTagSchema);
      const followerModel = getCollection(
        asset,
        postFollowerCollection,
        postFollowerSchema
      );
      let postResponse;

      if (args.payload.id) {
        existingPost = await model.findById(args.payload.id);
        postResponse = await model.findByIdAndUpdate(
          args.payload.id,
          { ...args.payload, updatedBy: user.userId },
          { new: true }
        );
      } else {
        const data = new model({
          ...args.payload,
          followers: 1,
          createdBy: user.userId,
          updatedBy: user.userId,
        });
        postResponse = await data.save();

        await followerModel.findOneAndUpdate(
          { postId: postResponse.id, userId: user.userId },
          { postId: postResponse.id, userId: user.userId },
          { upsert: true, new: true, rawResult: true }
        );
      }

      args.payload.addTags.forEach(async (item) => {
        const data = new tagModel({
          name: item,
          postId: postResponse._id,
        });
        await data.save();
      });

      args.payload.removeTags.forEach(async (item) => {
        await tagModel.deleteMany({
          postId: postResponse._id,
          name: item,
        });
      });

      return postResponse;
    },
    deletePost: async (_, { id }, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(asset, postCollection, postSchema);
      const tagModel = getCollection(asset, postTagCollection, postTagSchema);

      const res = await model.findByIdAndDelete(id);

      await tagModel.deleteMany({
        postId: id,
      });

      return res;
    },
  },
};

module.exports = { typeDefs, resolvers };
