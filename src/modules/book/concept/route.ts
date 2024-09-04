import { asyncHandler } from "../../../handler";
import { authorizeApi } from "../../../middlewares";
import {
  updateBookConcept,
  createBookConcept,
  generateConcepts,
  getBookConceptById,
  getBookConceptsByBookReference,
  getBookConceptByBookReference,
  deleteBookConcept,
  deleteBookConceptByReference,
} from "./service";

module.exports = function (router: any) {
  router.put(
    "/book/concept/:space",
    authorizeApi,
    asyncHandler(updateBookConcept)
  );
  router.post(
    "/book/concept/:space",
    authorizeApi,
    asyncHandler(createBookConcept)
  );
  router.post(
    "/book/concept/:space/:bookref/generate-concepts",
    authorizeApi,
    asyncHandler(generateConcepts)
  );
  router.get(
    "/book/concept/:space/id/:id",
    authorizeApi,
    asyncHandler(getBookConceptById)
  );
  router.get(
    "/book/concept/:space/:bookref",
    authorizeApi,
    asyncHandler(getBookConceptsByBookReference)
  );
  router.get(
    "/book/concept/:space/:bookref/:conceptref",
    authorizeApi,
    asyncHandler(getBookConceptByBookReference)
  );
  router.delete(
    "/book/concept/:space/:id",
    authorizeApi,
    asyncHandler(deleteBookConcept)
  );
  router.delete(
    "/book/concept/:space/reference/:reference",
    authorizeApi,
    asyncHandler(deleteBookConceptByReference)
  );
};
