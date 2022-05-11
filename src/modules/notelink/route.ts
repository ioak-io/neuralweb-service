import { asyncHandler } from "../../handler";
import { authorizeApi } from "../../middlewares";
import { getNotelink, getBacklinksByReference } from "./service";

const selfRealm = 100;

module.exports = function (router: any) {
  router.get("/notelink/:space", authorizeApi, asyncHandler(getNotelink));
  router.get(
    "/notelink/:space/backlink/:reference",
    authorizeApi,
    asyncHandler(getBacklinksByReference)
  );
  // router.post("/auth/token", issueToken);
  // router.get("/auth/token/decode", authorizeApi, decodeToken);
  // router.post("/auth/logout", logout);
  // router.get("/auth/oa/session/:id", (req: any, res: any) =>
  //   validateSession(selfRealm, req, res)
  // );
};
