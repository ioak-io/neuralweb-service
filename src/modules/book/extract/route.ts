import { asyncHandler } from "../../../handler";
import { authorizeApi } from "../../../middlewares";
import {
  updateExtract,
  createExtract,
  deleteExtract,
  getExtractsByBookReference,
} from "./service";

module.exports = function (router: any) {
  router.put(
    "/book/extract/:space/:bookref/:id",
    authorizeApi,
    asyncHandler(updateExtract)
  );
  router.post(
    "/book/extract/:space/:bookref",
    authorizeApi,
    asyncHandler(createExtract)
  );
  router.get(
    "/book/extract/:space/bookref/:bookref",
    authorizeApi,
    asyncHandler(getExtractsByBookReference)
  );
  router.delete(
    "/book/extract/:space/:id",
    authorizeApi,
    asyncHandler(deleteExtract)
  );
};
