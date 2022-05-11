import { authorizeApi } from "../../../middlewares";
import {
  updateScheduleReceipt,
  getScheduleReceipt,
  getScheduleReceiptById,
  runTransaction,
  deleteTransaction,
} from "./service";

const selfRealm = 100;

module.exports = function (router: any) {
  router.put("/schedule/receipt/:space", authorizeApi, updateScheduleReceipt);
  router.get("/schedule/receipt/:space", authorizeApi, getScheduleReceipt);
  router.get(
    "/schedule/receipt/:space/:id",
    authorizeApi,
    getScheduleReceiptById
  );
  router.post(
    "/schedule/receipt/:space/:id/transaction/run",
    authorizeApi,
    runTransaction
  );
  router.delete(
    "/schedule/receipt/:space/:id/transaction/delete",
    authorizeApi,
    deleteTransaction
  );
  // router.post("/auth/token", issueToken);
  // router.get("/auth/token/decode", authorizeApi, decodeToken);
  // router.post("/auth/logout", logout);
  // router.get("/auth/oa/session/:id", (req: any, res: any) =>
  //   validateSession(selfRealm, req, res)
  // );
};
