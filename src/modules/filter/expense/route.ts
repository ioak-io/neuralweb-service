import { authorizeApi } from "../../../middlewares";
import {
  updateFilterExpense,
  getFilterExpense,
  publishAllFilterExpense,
} from "./service";

const selfRealm = 100;

module.exports = function (router: any) {
  router.put(
    "/filter/expense/:space/publish/all",
    authorizeApi,
    publishAllFilterExpense
  );
  router.put("/filter/expense/:space", authorizeApi, updateFilterExpense);
  router.get("/filter/expense/:space", authorizeApi, getFilterExpense);
  // router.post("/auth/token", issueToken);
  // router.get("/auth/token/decode", authorizeApi, decodeToken);
  // router.post("/auth/logout", logout);
  // router.get("/auth/oa/session/:id", (req: any, res: any) =>
  //   validateSession(selfRealm, req, res)
  // );
};
