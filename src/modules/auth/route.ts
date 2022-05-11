import { asyncHandler } from "../../handler";
import { authorizeApi } from "../../middlewares";
import {
  signin,
  issueToken,
  decodeToken,
  logout,
  validateSession,
  deleteSession,
  decodeSession,
} from "./service";

const selfRealm = 100;

module.exports = function (router: any) {
  router.post("/auth/authorize", asyncHandler(signin));
  router.post("/auth/token", asyncHandler(issueToken));
  router.get("/auth/token/decode", authorizeApi, asyncHandler(decodeToken));
  router.post("/auth/logout", asyncHandler(logout));
  router.get("/auth/oa/session/:id", (req: any, res: any, next: any) =>
    asyncHandler(validateSession(selfRealm, req, res, next))
  );
  router.delete("/auth/oa/session/:id", (req: any, res: any, next: any) =>
    asyncHandler(deleteSession(selfRealm, req, res, next))
  );
  router.get("/auth/oa/session/:id/decode", (req: any, res: any, next: any) =>
    asyncHandler(decodeSession(selfRealm, req, res, next))
  );
  // Realm endpoints
  router.get(
    "/auth/realm/:realm/session/:id",
    (req: any, res: any, next: any) =>
      asyncHandler(validateSession(req.params.realm, req, res, next))
  );
  router.get(
    "/auth/realm/:realm/session/:id/decode",
    (req: any, res: any, next: any) =>
      asyncHandler(decodeSession(req.params.realm, req, res, next))
  );
  router.delete(
    "/auth/realm/:realm/session/:id",
    (req: any, res: any, next: any) =>
      asyncHandler(deleteSession(req.params.realm, req, res, next))
  );
};
