import { asyncHandler } from "../../handler";
import { authorizeApi } from "../../middlewares";
import {
  updateBill,
  getBill,
  getBillById,
  searchReceipt,
  getDuplicate,
  fixDuplicate,
} from "./service";

const selfRealm = 100;

module.exports = function (router: any) {
  router.put("/bill/:space", authorizeApi, asyncHandler(updateBill));
  router.get("/bill/:space", authorizeApi, asyncHandler(getBill));
  router.post("/receipt/:space", authorizeApi, asyncHandler(searchReceipt));
  router.post(
    "/receipt/:space/action/getduplicate",
    authorizeApi,
    asyncHandler(getDuplicate)
  );
  router.post(
    "/receipt/:space/action/fixduplicate",
    authorizeApi,
    asyncHandler(fixDuplicate)
  );
  router.get("/bill/:space/:id", authorizeApi, asyncHandler(getBillById));
  // router.post("/bill/:space", authorizeApi, searchBill);
};
