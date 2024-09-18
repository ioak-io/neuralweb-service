import { asyncHandler } from "../../../handler";
import { authorizeApi } from "../../../middlewares";
import {
  updateDetail,
  createDetail,
  getDetailsByBookReference,
  getDetailsByBookReferenceShortform,
  deleteDetail,
} from "./service";

module.exports = function (router: any) {
  router.put(
    "/book/detail/:space/:id",
    authorizeApi,
    asyncHandler(updateDetail)
  );
  router.post(
    "/book/detail/:space/:bookref",
    authorizeApi,
    asyncHandler(createDetail)
  );
  router.get(
    "/book/detail/:space/:bookref",
    authorizeApi,
    asyncHandler(getDetailsByBookReference)
  );
  router.get(
    "/book/detail-shortform/:space/:bookref",
    authorizeApi,
    asyncHandler(getDetailsByBookReferenceShortform)
  );
  router.delete(
    "/book/detail/:space/:id",
    authorizeApi,
    asyncHandler(deleteDetail)
  );
};
