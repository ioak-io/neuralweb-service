import { asyncHandler } from "../../../handler";
import { authorizeApi } from "../../../middlewares";
import {
  updateBookTheme,
  createBookTheme,
  getBookThemeById,
  getBookThemesByBookReference,
  getBookThemesByConceptReference,
  getBookThemeByBookReference,
  deleteBookTheme,
  deleteBookThemeByReference,
} from "./service";

module.exports = function (router: any) {
  router.put(
    "/book/theme/:space",
    authorizeApi,
    asyncHandler(updateBookTheme)
  );
  router.post(
    "/book/theme/:space",
    authorizeApi,
    asyncHandler(createBookTheme)
  );
  router.get(
    "/book/theme/:space/id/:id",
    authorizeApi,
    asyncHandler(getBookThemeById)
  );
  router.get(
    "/book/theme/:space/:bookref",
    authorizeApi,
    asyncHandler(getBookThemesByBookReference)
  );
  router.get(
    "/book/theme/:space/:bookref/:conceptref",
    authorizeApi,
    asyncHandler(getBookThemesByConceptReference)
  );
  router.get(
    "/book/theme/:space/:bookref/:conceptref/:themeref",
    authorizeApi,
    asyncHandler(getBookThemeByBookReference)
  );
  router.delete(
    "/book/theme/:space/:id",
    authorizeApi,
    asyncHandler(deleteBookTheme)
  );
  router.delete(
    "/book/theme/:space/reference/:reference",
    authorizeApi,
    asyncHandler(deleteBookThemeByReference)
  );
};
