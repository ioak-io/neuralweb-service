import { authorizeApi } from "../../../middlewares";
import { createUserInviteEndpoint, getUserInvite } from "./service";

const selfRealm = 100;

module.exports = function (router: any) {
  router.post("/user/invite/:space", authorizeApi, createUserInviteEndpoint);
  router.get("/user/invite/:space", authorizeApi, getUserInvite);
  // router.post("/auth/token", issueToken);
  // router.get("/auth/token/decode", authorizeApi, decodeToken);
  // router.post("/auth/logout", logout);
  // router.get("/auth/oa/session/:id", (req: any, res: any) =>
  //   validateSession(selfRealm, req, res)
  // );
};
