import { authorizeApi } from "../../middlewares";
import { updateIncomeCategory, getIncomeCategory } from "./service";

const selfRealm = 100;

module.exports = function (router: any) {
  router.put("/incomecategory/:space", authorizeApi, updateIncomeCategory);
  router.get("/incomecategory/:space", authorizeApi, getIncomeCategory);
  // router.post("/auth/token", issueToken);
  // router.get("/auth/token/decode", authorizeApi, decodeToken);
  // router.post("/auth/logout", logout);
  // router.get("/auth/oa/session/:id", (req: any, res: any) =>
  //   validateSession(selfRealm, req, res)
  // );
};
