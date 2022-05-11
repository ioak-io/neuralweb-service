import { authorizeApi } from "../../middlewares";
import { updateCompany, getCompany } from "./service";

const selfRealm = 100;

module.exports = function (router: any) {
  router.put("/company", authorizeApi, updateCompany);
  router.get("/company", authorizeApi, getCompany);
  // router.post("/auth/token", issueToken);
  // router.get("/auth/token/decode", authorizeApi, decodeToken);
  // router.post("/auth/logout", logout);
  // router.get("/auth/oa/session/:id", (req: any, res: any) =>
  //   validateSession(selfRealm, req, res)
  // );
};
