import { asyncHandler } from "../../../handler";
import { authorizeApi } from "../../../middlewares";
import {
  updateDetail,
  createDetail,
  getDetailsByBookReference,
  deleteDetail,
} from "./service";

module.exports = function (router: any) {
  router.put(
    "/book/section-detail/:space/:id",
    authorizeApi,
    asyncHandler(updateDetail)
  );
  router.post(
    "/book/section-detail/:space/:bookref/:sectionref",
    authorizeApi,
    asyncHandler(createDetail)
  );
  router.get(
    "/book/section-detail/:space/:bookref/:sectionref",
    authorizeApi,
    asyncHandler(getDetailsByBookReference)
  );
  router.delete(
    "/book/section-detail/:space/:id",
    authorizeApi,
    asyncHandler(deleteDetail)
  );
};
