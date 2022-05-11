import { asyncHandler } from "../../handler";
import { authorizeApi } from "../../middlewares";
import { updateFolder, getFolder, deleteFolder } from "./service";

const selfRealm = 100;

module.exports = function (router: any) {
  router.put("/folder/:space", authorizeApi, asyncHandler(updateFolder));
  router.get("/folder/:space", authorizeApi, asyncHandler(getFolder));
  router.delete("/folder/:space/:id", authorizeApi, asyncHandler(deleteFolder));
  // router.post("/auth/token", issueToken);
  // router.get("/auth/token/decode", authorizeApi, decodeToken);
  // router.post("/auth/logout", logout);
  // router.get("/auth/oa/session/:id", (req: any, res: any) =>
  //   validateSession(selfRealm, req, res)
  // );
};
