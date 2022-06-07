import { authorizeApi } from "../../middlewares";
import { updateFilterGroup, getFilterGroup } from "./service";

const selfRealm = 100;

module.exports = function (router: any) {
  router.put("/filter-group/:space", authorizeApi, updateFilterGroup);
  router.get("/filter-group/:space", authorizeApi, getFilterGroup);
  // router.post("/auth/token", issueToken);
  // router.get("/auth/token/decode", authorizeApi, decodeToken);
  // router.post("/auth/logout", logout);
  // router.get("/auth/oa/session/:id", (req: any, res: any) =>
  //   validateSession(selfRealm, req, res)
  // );
};
