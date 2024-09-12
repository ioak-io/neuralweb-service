import { asyncHandler } from "../../../handler";
import { authorizeApi } from "../../../middlewares";
import {
  updateConceptDetail,
  createConceptDetail,
  getConceptDetailsByBookReference,
  getConceptDetailsByBookReferenceShortform,
  deleteConceptDetail,
} from "./service";

module.exports = function (router: any) {
  router.put(
    "/book/concept-detail/:space/:id",
    authorizeApi,
    asyncHandler(updateConceptDetail)
  );
  router.post(
    "/book/concept-detail/:space/:bookref/:conceptref",
    authorizeApi,
    asyncHandler(createConceptDetail)
  );
  router.get(
    "/book/concept-detail/:space/:bookref/:conceptref",
    authorizeApi,
    asyncHandler(getConceptDetailsByBookReference)
  );
  router.get(
    "/book/concept-detail-shortform/:space/:bookref",
    authorizeApi,
    asyncHandler(getConceptDetailsByBookReferenceShortform)
  );
  router.delete(
    "/book/concept-detail/:space/:id",
    authorizeApi,
    asyncHandler(deleteConceptDetail)
  );
};
