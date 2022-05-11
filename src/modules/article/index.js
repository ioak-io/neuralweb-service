const { gql, AuthenticationError } = require("apollo-server-express");
const { GraphQLScalarType } = require("graphql");
const { articleSchema, articleCollection } = require("./model");
const { articleTagSchema, articleTagCollection } = require("./tag/model");
const { categorySchema, categoryCollection } = require("./category/model");
const { getCollection } = require("../../lib/dbutils");

const typeDefs = gql`
  scalar DateScalar
  extend type Query {
    article(id: ID!): Article
    articles(categoryId: ID!, pageSize: Int, pageNo: Int): ArticlePaginated
    searchArticles(text: String, pageSize: Int, pageNo: Int): ArticlePaginated
    getArticles(
      text: String
      categoryId: String
      pageSize: Int
      pageNo: Int
    ): ArticlePaginated
  }

  extend type Mutation {
    addArticle(payload: ArticlePayload): Article
    deleteArticle(id: ID!): Article
  }

  input ArticlePayload {
    id: String
    title: JSON
    description: JSON
    categoryId: String
    addTags: [String]
    removeTags: [String]
  }

  type ArticlePaginated {
    pageNo: Int
    hasMore: Boolean
    total: Int
    results: [Article]!
  }

  type Article {
    id: ID!
    title: JSON
    description: JSON
    views: Int!
    comments: Int!
    isAnswered: Boolean!
    answeredOn: DateScalar
    helpful: Int!
    notHelpful: Int!
    createdAt: DateScalar
    updatedAt: DateScalar
  }

  extend type ArticleFeedback {
    article: Article
  }
  extend type ArticleTag {
    article: Article
  }
  extend type ArticleComment {
    article: Article
  }
`;

const resolvers = {
  DateScalar: new GraphQLScalarType({
    name: "DateScalar",
    description: "Date custom scalar type",
    parseValue(value) {
      return new Date(value); // value from the client
    },
    serialize(value) {
      return value.getTime(); // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(+ast.value); // ast value is always in string format
      }
      return null;
    },
  }),
  Query: {
    article: async (_, { id }, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(asset, articleCollection, articleSchema);
      response = await model.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { new: true }
      );
      return response;
    },
    articles: async (
      _,
      { categoryId, pageSize = 0, pageNo = 0 },
      { asset, user }
    ) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      if (!categoryId) {
        return {
          results: [],
          pageNo: 0,
          hasMore: false,
        };
      }
      const model = getCollection(asset, articleCollection, articleSchema);
      const response = await model
        .find({ categoryId: categoryId })
        .skip(pageNo * pageSize)
        .limit(pageSize);
      return {
        results: response,
        pageNo: response.length === pageSize ? pageNo + 1 : pageNo,
        hasMore: response.length === pageSize ? true : false,
      };
    },
    searchArticles: async (
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
      const model = getCollection(asset, articleCollection, articleSchema);
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
    getArticles: async (
      _,
      { text, categoryId, pageSize = 0, pageNo = 0 },
      { asset, user }
    ) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(asset, articleCollection, articleSchema);
      let res = [];
      if (text) {
        res = await model
          .find({
            $or: [
              { description: { $regex: new RegExp(text, "ig") } },
              { title: { $regex: new RegExp(text, "ig") } },
            ],
          })
          .skip(pageNo * pageSize)
          .limit(pageSize);
      } else if (categoryId) {
        res = await model
          .find({ categoryId: categoryId })
          .skip(pageNo * pageSize)
          .limit(pageSize);
      } else {
        res = await model
          .find()
          .skip(pageNo * pageSize)
          .limit(pageSize);
      }

      // return {
      //   results: [],
      //   pageNo: 0,
      //   hasMore: false,
      //   total: 0,
      // };
      return {
        results: res,
        pageNo: res.length === pageSize ? pageNo + 1 : pageNo,
        hasMore: res.length === pageSize ? true : false,
      };
    },
  },

  ArticleFeedback: {
    article: async (parent, _, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(asset, articleCollection, articleSchema);
      return await model.findById(parent.articleId);
    },
  },

  ArticleTag: {
    article: async (parent, _, { asset, user }) => {
      const model = getCollection(asset, articleCollection, articleSchema);
      return await model.findById(parent.articleId);
    },
  },

  ArticleComment: {
    article: async (parent, _, { asset, user }) => {
      const model = getCollection(asset, articleCollection, articleSchema);
      return await model.findById(parent.articleId);
    },
  },

  Mutation: {
    addArticle: async (_, args, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(asset, articleCollection, articleSchema);
      const tagModel = getCollection(
        asset,
        articleTagCollection,
        articleTagSchema
      );
      let articleResponse;

      if (args.payload.id) {
        existingArticle = await model.findById(args.payload.id);
        if (existingArticle.categoryId !== args.payload.categoryId) {
          const categoryModel = getCollection(
            asset,
            categoryCollection,
            categorySchema
          );
          await categoryModel.findByIdAndUpdate(
            existingArticle.categoryId,
            { $inc: { articles: -1 } },
            { new: true }
          );
          await categoryModel.findByIdAndUpdate(
            args.payload.categoryId,
            { $inc: { articles: 1 } },
            { new: true }
          );
        }
        articleResponse = await model.findByIdAndUpdate(
          args.payload.id,
          args.payload,
          { new: true }
        );
      } else {
        const data = new model(args.payload);
        articleResponse = await data.save();
        const categoryModel = getCollection(
          asset,
          categoryCollection,
          categorySchema
        );
        await categoryModel.findByIdAndUpdate(
          args.payload.categoryId,
          { $inc: { articles: 1 } },
          { new: true }
        );
      }

      args.payload.addTags.forEach(async (item) => {
        const data = new tagModel({
          name: item,
          articleId: articleResponse._id,
        });
        await data.save();
      });

      args.payload.removeTags.forEach(async (item) => {
        await tagModel.deleteMany({
          articleId: articleResponse._id,
          name: item,
        });
      });

      // const categoryStat = await model.aggregate([
      //   {
      //     $group: {
      //       _id: '$categoryId',
      //       count: { $sum: 1 },
      //     },
      //   },
      // ]);

      return articleResponse;
    },
    deleteArticle: async (_, { id }, { asset, user }) => {
      if (!asset || !user) {
        return new AuthenticationError("Not authorized to access this content");
      }
      const model = getCollection(asset, articleCollection, articleSchema);
      const tagModel = getCollection(
        asset,
        articleTagCollection,
        articleTagSchema
      );

      const res = await model.findByIdAndDelete(id);

      await tagModel.deleteMany({
        articleId: id,
      });

      return res;
    },
  },
};

module.exports = { typeDefs, resolvers };
