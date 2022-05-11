import { authorizeApi } from "../../middlewares";
import { updateIncome, getIncome, searchIncome } from "./service";

const selfRealm = 100;

module.exports = function (router: any) {
  router.put("/income/:space", authorizeApi, updateIncome);
  router.get("/income/:space", authorizeApi, getIncome);
  router.post("/income/:space", authorizeApi, searchIncome);
  // router.post("/auth/token", issueToken);
  // router.get("/auth/token/decode", authorizeApi, decodeToken);
  // router.post("/auth/logout", logout);
  // router.get("/auth/oa/session/:id", (req: any, res: any) =>
  //   validateSession(selfRealm, req, res)
  // );
};
