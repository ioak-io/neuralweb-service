import { asyncHandler } from "../../../handler";
import { authorizeApi } from "../../../middlewares";
import {
  updateBookSection,
  createBookSection,
  generateSections,
  getBookSectionById,
  getBookSectionsByBookReference,
  getBookSectionByBookReference,
  deleteBookSection,
  deleteBookSectionByReference,
} from "./service";

module.exports = function (router: any) {
  router.put(
    "/book/section/:space/:bookref/:sectionref",
    authorizeApi,
    asyncHandler(updateBookSection)
  );
  router.post(
    "/book/section/:space/:bookref",
    authorizeApi,
    asyncHandler(createBookSection)
  );
  router.post(
    "/book/section/:space/:bookref/generate-sections",
    authorizeApi,
    asyncHandler(generateSections)
  );
  router.get(
    "/book/section/:space/id/:id",
    authorizeApi,
    asyncHandler(getBookSectionById)
  );
  router.get(
    "/book/section/:space/:bookref",
    authorizeApi,
    asyncHandler(getBookSectionsByBookReference)
  );
  router.get(
    "/book/section/:space/:bookref/:sectionref",
    authorizeApi,
    asyncHandler(getBookSectionByBookReference)
  );
  router.delete(
    "/book/section/:space/:id",
    authorizeApi,
    asyncHandler(deleteBookSection)
  );
  router.delete(
    "/book/section/:space/reference/:reference",
    authorizeApi,
    asyncHandler(deleteBookSectionByReference)
  );
};
