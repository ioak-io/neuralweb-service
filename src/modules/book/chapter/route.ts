import { asyncHandler } from "../../../handler";
import { authorizeApi } from "../../../middlewares";
import {
  updateBookChapter,
  createBookChapter,
  generateChapters,
  getBookChapterById,
  getBookChaptersByBookReference,
  getBookChapterByBookReference,
  deleteBookChapter,
  deleteBookChapterByReference,
} from "./service";

module.exports = function (router: any) {
  router.put(
    "/book/chapter/:space",
    authorizeApi,
    asyncHandler(updateBookChapter)
  );
  router.post(
    "/book/chapter/:space",
    authorizeApi,
    asyncHandler(createBookChapter)
  );
  router.post(
    "/book/chapter/:space/:bookref/generate-chapters",
    authorizeApi,
    asyncHandler(generateChapters)
  );
  router.get(
    "/book/chapter/:space/id/:id",
    authorizeApi,
    asyncHandler(getBookChapterById)
  );
  router.get(
    "/book/chapter/:space/:bookref",
    authorizeApi,
    asyncHandler(getBookChaptersByBookReference)
  );
  router.get(
    "/book/chapter/:space/:bookref/:chapterref",
    authorizeApi,
    asyncHandler(getBookChapterByBookReference)
  );
  router.delete(
    "/book/chapter/:space/:id",
    authorizeApi,
    asyncHandler(deleteBookChapter)
  );
  router.delete(
    "/book/chapter/:space/reference/:reference",
    authorizeApi,
    asyncHandler(deleteBookChapterByReference)
  );
};
