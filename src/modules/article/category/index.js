const { gql, AuthenticationError } = require("apollo-server-express");
const { categoryCollection, categorySchema } = require("./model");
const { getCollection } = require("../../../lib/dbutils");
const { isUnauthorized } = require("../../../lib/authutils");

const typeDefs = gql`
  extend type Query {
    articleCategory(id: ID!): ArticleCategory
    articleCategories: [ArticleCategory]
  }

  extend type Mutation {
    addArticleCategory(payload: ArticleCategoryPayload): ArticleCategory
  }

  input ArticleCategoryPayload {
    id: String
    name: String
  }

  extend type Article {
    category: ArticleCategory
  }

  type ArticleCategory {
    id: ID!
    name: String
    articles: Int
  }
`;

const resolvers = {
  Query: {
    articleCategory: async (_, { id }, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(asset, categoryCollection, categorySchema);
      return await model.findById(id);
    },
    articleCategories: async (_, __, { user, asset }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(asset, categoryCollection, categorySchema);
      return await model.find();
    },
  },

  Mutation: {
    addArticleCategory: async (_, args, { user, asset }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(asset, categoryCollection, categorySchema);
      if (args.payload.id) {
        return await model.findByIdAndUpdate(args.payload.id, args.payload, {
          new: true,
        });
      } else {
        const data = new model(args.payload);
        return await data.save();
      }
    },
  },

  Article: {
    category: {
      resolve: async (parent, _args, { asset, user }, info) => {
        if (!asset || !user) {
          return new AuthenticationError(
            "Not authorized to access this content"
          );
        }
        const model = getCollection(asset, categoryCollection, categorySchema);
        return await model.findById(parent.categoryId);
      },
    },
  },
};

module.exports = { typeDefs, resolvers };
