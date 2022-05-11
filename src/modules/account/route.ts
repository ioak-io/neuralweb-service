import { authorizeApi } from "../../middlewares";
import { getAccount, updateAccount } from "./service";

const selfRealm = 100;

module.exports = function (router: any) {
  router.put("/account/:space", authorizeApi, updateAccount);
  router.get("/account/:space", authorizeApi, getAccount);
  // router.post("/auth/token", issueToken);
  // router.get("/auth/token/decode", authorizeApi, decodeToken);
  // router.post("/auth/logout", logout);
  // router.get("/auth/oa/session/:id", (req: any, res: any) =>
  //   validateSession(selfRealm, req, res)
  // );
};
