import { asyncHandler } from "../../../handler";
import { authorizeApi } from "../../../middlewares";
import {
  updateBookSubtheme,
  createBookSubtheme,
  getBookSubthemeById,
  getBookSubthemesByBookReference,
  getBookSubthemeByBookReference,
  deleteBookSubtheme,
  deleteBookSubthemeByReference,
} from "./service";

module.exports = function (router: any) {
  router.put(
    "/book/subtheme/:space",
    authorizeApi,
    asyncHandler(updateBookSubtheme)
  );
  router.post(
    "/book/subtheme/:space",
    authorizeApi,
    asyncHandler(createBookSubtheme)
  );
  router.get(
    "/book/subtheme/:space/id/:id",
    authorizeApi,
    asyncHandler(getBookSubthemeById)
  );
  router.get(
    "/book/subtheme/:space/:bookref",
    authorizeApi,
    asyncHandler(getBookSubthemesByBookReference)
  );
  router.get(
    "/book/subtheme/:space/:bookref/:conceptref/:subthemeref",
    authorizeApi,
    asyncHandler(getBookSubthemeByBookReference)
  );
  router.delete(
    "/book/subtheme/:space/:id",
    authorizeApi,
    asyncHandler(deleteBookSubtheme)
  );
  router.delete(
    "/book/subtheme/:space/reference/:reference",
    authorizeApi,
    asyncHandler(deleteBookSubthemeByReference)
  );
};
