const { gql, AuthenticationError } = require("apollo-server-express");
const { postTagSchema, postTagCollection } = require("./model");
const { getCollection } = require("../../../lib/dbutils");

const typeDefs = gql`
  extend type Query {
    postTagCloud: [PostTagCloud]
    postsByTag(tag: String!, pageSize: Int, pageNo: Int): PostTagPaginated
  }

  type PostTagPaginated {
    pageNo: Int
    hasMore: Boolean
    total: Int
    results: [PostTag]!
  }

  type PostTagCloud {
    name: String
    count: Int
  }

  type PostTag {
    id: ID!
    name: String
  }

  extend type Post {
    tags: [PostTag]
  }
`;

const resolvers = {
  Query: {
    postTagCloud: async (_, __, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(asset, postTagCollection, postTagSchema);
      return await model.aggregate([
        {
          $group: {
            _id: "$name",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            name: "$_id",
            count: "$count",
          },
        },
      ]);
    },
    postsByTag: async (
      _,
      { tag, pageSize = 0, pageNo = 0 },
      { asset, user }
    ) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      if (!tag) {
        return {
          results: [],
          pageNo: 0,
          hasMore: false,
        };
      }
      const model = getCollection(asset, postTagCollection, postTagSchema);
      const response = await model
        .find({ name: tag })
        .skip(pageNo * pageSize)
        .limit(pageSize);
      return {
        results: response,
        pageNo: response.length === pageSize ? pageNo + 1 : pageNo,
        hasMore: response.length === pageSize ? true : false,
      };
    },
    // tags: async (_, __, { user }) => {
    //   // if (!user) {
    //   //   return new AuthenticationError('Not authorized to access this content');
    //   // }
    //   const model = getCollection(210, postTagCollection, postTagSchema);
    //   return await model.find({});
    // },
  },

  Post: {
    tags: {
      resolve: async (parent, _args, { asset, user }, info) => {
        if (!asset || !user) {
          return new AuthenticationError(
            "Not authorized to access this content"
          );
        }
        const model = getCollection(asset, postTagCollection, postTagSchema);
        return await model.find({ postId: parent.id });
      },
    },
  },
};

module.exports = { typeDefs, resolvers };
