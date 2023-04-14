import { asyncHandler } from "../../handler";
import { authorizeApi } from "../../middlewares";
import { importExpense, deleteTransaction, exportData } from "./service";
const multer = require("multer");
var upload = multer();

const selfRealm = 100;

module.exports = function (router: any) {
  router.post(
    "/import/:space",
    upload.single("file"),
    authorizeApi,
    asyncHandler(importExpense)
  );
  router.post("/export/:space", authorizeApi, asyncHandler(exportData));
  router.delete(
    "/import/:space/transaction/:transactionId",
    authorizeApi,
    asyncHandler(deleteTransaction)
  );
  // router.post("/auth/token", issueToken);
  // router.get("/auth/token/decode", authorizeApi, decodeToken);
  // router.post("/auth/logout", logout);
  // router.get("/auth/oa/session/:id", (req: any, res: any) =>
  //   validateSession(selfRealm, req, res)
  // );
};
