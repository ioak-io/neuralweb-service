import { asyncHandler } from "../../../handler";
import { authorizeApi } from "../../../middlewares";
import {
  updateThemeDetail,
  createThemeDetail,
  getThemeDetailsByBookReference,
  deleteThemeDetail,
} from "./service";

module.exports = function (router: any) {
  router.put(
    "/book/theme-detail/:space/:id",
    authorizeApi,
    asyncHandler(updateThemeDetail)
  );
  router.post(
    "/book/theme-detail/:space/:bookref/:conceptref/:themeref",
    authorizeApi,
    asyncHandler(createThemeDetail)
  );
  router.get(
    "/book/theme-detail/:space/:bookref/:conceptref/:themeref",
    authorizeApi,
    asyncHandler(getThemeDetailsByBookReference)
  );
  router.delete(
    "/book/theme-detail/:space/:id",
    authorizeApi,
    asyncHandler(deleteThemeDetail)
  );
};
