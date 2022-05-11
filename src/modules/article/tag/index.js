const { gql, AuthenticationError } = require("apollo-server-express");
const { articleTagSchema, articleTagCollection } = require("./model");
const { getCollection } = require("../../../lib/dbutils");

const typeDefs = gql`
  extend type Query {
    articleTagCloud: [ArticleTagCloud]
    articlesByTag(tag: String!, pageSize: Int, pageNo: Int): ArticleTagPaginated
  }

  type ArticleTagPaginated {
    pageNo: Int
    hasMore: Boolean
    total: Int
    results: [ArticleTag]!
  }

  type ArticleTagCloud {
    name: String
    count: Int
  }

  type ArticleTag {
    id: ID!
    name: String
  }

  extend type Article {
    tags: [ArticleTag]
  }
`;

const resolvers = {
  Query: {
    articleTagCloud: async (_, __, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(
        asset,
        articleTagCollection,
        articleTagSchema
      );
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
    articlesByTag: async (
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
      const model = getCollection(
        asset,
        articleTagCollection,
        articleTagSchema
      );
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
    //   const model = getCollection(210, articleTagCollection, articleTagSchema);
    //   return await model.find({});
    // },
  },

  Article: {
    tags: {
      resolve: async (parent, _args, { asset, user }, info) => {
        if (!asset || !user) {
          return new AuthenticationError(
            "Not authorized to access this content"
          );
        }
        const model = getCollection(
          asset,
          articleTagCollection,
          articleTagSchema
        );
        return await model.find({ articleId: parent.id });
      },
    },
  },
};

module.exports = { typeDefs, resolvers };
