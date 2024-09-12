import { asyncHandler } from "../../../handler";
import { authorizeApi } from "../../../middlewares";
import {
  updateShortform,
  createShortform,
  getShortformsByBookReference,
  deleteShortform,
} from "./service";

module.exports = function (router: any) {
  router.put(
    "/book/shortform/:space",
    authorizeApi,
    asyncHandler(updateShortform)
  );
  router.post(
    "/book/shortform/:space/:bookref",
    authorizeApi,
    asyncHandler(createShortform)
  );
  router.get(
    "/book/shortform/:space/:bookref",
    authorizeApi,
    asyncHandler(getShortformsByBookReference)
  );
  router.delete(
    "/book/shortform/:space/:id",
    authorizeApi,
    asyncHandler(deleteShortform)
  );
};
