import { asyncHandler } from "../../../handler";
import { authorizeApi } from "../../../middlewares";
import { getAccountScope, updateAccountScope } from "./service";

const selfRealm = 100;

module.exports = function (router: any) {
  router.put(
    "/account/scope/:space",
    authorizeApi,
    asyncHandler(updateAccountScope)
  );
  router.get(
    "/account/scope/:space",
    authorizeApi,
    asyncHandler(getAccountScope)
  );
  // router.post("/auth/token", issueToken);
  // router.get("/auth/token/decode", authorizeApi, decodeToken);
  // router.post("/auth/logout", logout);
  // router.get("/auth/oa/session/:id", (req: any, res: any) =>
  //   validateSession(selfRealm, req, res)
  // );
};
