import { authorizeApi } from "../../middlewares";
import {
  updateExpense,
  getExpense,
  searchExpense,
  aggregateExpense,
  getDuplicate,
  fixDuplicate,
} from "./service";

const selfRealm = 100;

module.exports = function (router: any) {
  router.put("/expense/:space", authorizeApi, updateExpense);
  router.get("/expense/:space", authorizeApi, getExpense);
  router.post("/expense/:space", authorizeApi, searchExpense);
  router.post("/expense/:space/aggregate", authorizeApi, aggregateExpense);
  router.post(
    "/expense/:space/action/getduplicate",
    authorizeApi,
    getDuplicate
  );
  router.post(
    "/expense/:space/action/fixduplicate",
    authorizeApi,
    fixDuplicate
  );
  // router.post("/auth/token", issueToken);
  // router.get("/auth/token/decode", authorizeApi, decodeToken);
  // router.post("/auth/logout", logout);
  // router.get("/auth/oa/session/:id", (req: any, res: any) =>
  //   validateSession(selfRealm, req, res)
  // );
};
