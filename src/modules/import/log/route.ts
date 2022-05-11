import { authorizeApi } from "../../../middlewares";
import { getLog } from "./service";

const selfRealm = 100;

module.exports = function (router: any) {
  router.get("/import/log/:space", authorizeApi, getLog);
  // router.post("/auth/token", issueToken);
  // router.get("/auth/token/decode", authorizeApi, decodeToken);
  // router.post("/auth/logout", logout);
  // router.get("/auth/oa/session/:id", (req: any, res: any) =>
  //   validateSession(selfRealm, req, res)
  // );
};
