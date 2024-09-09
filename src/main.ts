if (module.hot) {
  module.hot.accept();
  module.hot.dispose(() => server.stop());
}

const { ApolloServer } = require("apollo-server-express");
import { authorize } from "./middlewares";
import mongoose from "mongoose";
import { initializeSequences } from "./startup";
const express = require("express");
const cors = require("cors");

var ApiRoute = require("./route");

const gqlScalarSchema = require("./modules/gql-scalar");
const assetSchema = require("./modules/asset");
const sessionSchema = require("./modules/session");
const userSchema = require("./modules/user");
const articleSchema = require("./modules/article");
const articleCommentSchema = require("./modules/article/comment");
const articleCommentFeedbackSchema = require("./modules/article/comment/feedback");
const articleFeedbackSchema = require("./modules/article/feedback");
const articleCategorySchema = require("./modules/article/category");
const articleTagSchema = require("./modules/article/tag");
const postSchema = require("./modules/post");
const postCommentSchema = require("./modules/post/comment");
const postCommentFeedbackSchema = require("./modules/post/comment/feedback");
const postFeedbackSchema = require("./modules/post/feedback");
const postFollowerSchema = require("./modules/post/follower");
const postTagSchema = require("./modules/post/tag");

const databaseUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
mongoose.connect(databaseUri, {
});
mongoose.pluralize(undefined);

const app = express();

const server = new ApolloServer({
  typeDefs: [
    gqlScalarSchema.typeDefs,
    assetSchema.typeDefs,
    sessionSchema.typeDefs,
    userSchema.typeDefs,
    articleSchema.typeDefs,
    articleCommentSchema.typeDefs,
    articleCommentFeedbackSchema.typeDefs,
    articleCategorySchema.typeDefs,
    articleFeedbackSchema.typeDefs,
    articleTagSchema.typeDefs,
    postSchema.typeDefs,
    postCommentSchema.typeDefs,
    postCommentFeedbackSchema.typeDefs,
    postFeedbackSchema.typeDefs,
    postFollowerSchema.typeDefs,
    postTagSchema.typeDefs,
  ],
  resolvers: [
    gqlScalarSchema.resolvers,
    assetSchema.resolvers,
    sessionSchema.resolvers,
    userSchema.resolvers,
    articleSchema.resolvers,
    articleCommentSchema.resolvers,
    articleCommentFeedbackSchema.resolvers,
    articleCategorySchema.resolvers,
    articleFeedbackSchema.resolvers,
    articleTagSchema.resolvers,
    postSchema.resolvers,
    postCommentSchema.resolvers,
    postCommentFeedbackSchema.resolvers,
    postFeedbackSchema.resolvers,
    postFollowerSchema.resolvers,
    postTagSchema.resolvers,
  ],
  context: ({ req, res }: any) => {
    const authString = req.headers.authorization || "";
    const authParts = authString.split(" ");
    let token = "";
    let user = null;
    let asset = "";
    if (authParts.length === 2) {
      token = authParts[1];
      asset = authParts[0];
      user = authorize(token);
    }
    return { user, token, asset };
  },
  introspection: true,
  playground: true,
});

server.start().then(() => server.applyMiddleware({ app }))


app.use(cors());

app.get("/hello", (_: any, res: any) => {
  res.send(
    "basic connection to server works. database connection is not validated"
  );
  res.end();
});

app.use(express.json({ limit: 5000000 }));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use("/api", ApiRoute);

app.use((_: any, res: any) => {
  res.status(404);
  res.send("Not found");
  res.end();
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).send(err.stack);
  // .send(err.name + ": " + err.message + "\n\nDetails:\n" + err.stack);
});

app.listen({ port: process.env.PORT || 4000 }, () =>
  console.log(
    `🚀 Server ready at http://localhost:${process.env.PORT || 4000}${
      server.graphqlPath
    }`
  )
);

// server
//   .listen({ port: process.env.PORT || 4000 })
//   .then(({ url }: any) => console.log(`Server started at ${url}`));

// Server startup scripts
initializeSequences();

// process.on("uncaughtException", (err) => {
//   console.log(`Uncaught Exception: ${err.message}`);
//   process.exit(1);
// });
