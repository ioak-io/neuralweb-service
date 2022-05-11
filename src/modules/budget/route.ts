import { authorizeApi } from "../../middlewares";
import { updateBudgetByYear, getBudgetByYear } from "./service";

const selfRealm = 100;

module.exports = function (router: any) {
  router.put("/budget/:space/:year", authorizeApi, updateBudgetByYear);
  router.get("/budget/:space/:year", authorizeApi, getBudgetByYear);
  // router.post("/auth/token", issueToken);
  // router.get("/auth/token/decode", authorizeApi, decodeToken);
  // router.post("/auth/logout", logout);
  // router.get("/auth/oa/session/:id", (req: any, res: any) =>
  //   validateSession(selfRealm, req, res)
  // );
};
