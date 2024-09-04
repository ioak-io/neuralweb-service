import { asyncHandler } from "../../../handler";
import { authorizeApi } from "../../../middlewares";
import {
  updateChapterDetail,
  createChapterDetail,
  getChapterDetailsByBookReference,
  deleteChapterDetail,
} from "./service";

module.exports = function (router: any) {
  router.put(
    "/book/chapter-detail/:space",
    authorizeApi,
    asyncHandler(updateChapterDetail)
  );
  router.post(
    "/book/chapter-detail/:space/:bookref/:chapterref",
    authorizeApi,
    asyncHandler(createChapterDetail)
  );
  router.get(
    "/book/chapter-detail/:space/:bookref/:chapterref",
    authorizeApi,
    asyncHandler(getChapterDetailsByBookReference)
  );
  router.delete(
    "/book/chapter-detail/:space/:id",
    authorizeApi,
    asyncHandler(deleteChapterDetail)
  );
};
