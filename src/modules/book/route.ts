import { asyncHandler } from "../../handler";
import { authorizeApi } from "../../middlewares";
import {
  updateBook,
  createBook,
  getLibraries,
  searchBook,
  getBookById,
  getBookByReference,
  deleteBook,
  deleteBookByReference,
  validateBook,
} from "./service";

module.exports = function (router: any) {
  router.put("/book/:space", authorizeApi, asyncHandler(updateBook));
  router.post("/book/:space", authorizeApi, asyncHandler(createBook));
  router.post("/book/:space/validate-book", authorizeApi, asyncHandler(validateBook));
  // router.get("/book/:space", authorizeApi, asyncHandler(getBook));
  router.post(
    "/book/:space/search",
    authorizeApi,
    asyncHandler(searchBook)
  );
  router.get("/book/:space", authorizeApi, asyncHandler(getLibraries));
  router.get(
    "/book/:space/id/:id",
    authorizeApi,
    asyncHandler(getBookById)
  );
  router.get(
    "/book/:space/reference/:reference",
    authorizeApi,
    asyncHandler(getBookByReference)
  );
  router.delete(
    "/book/:space/:id",
    authorizeApi,
    asyncHandler(deleteBook)
  );
  router.delete(
    "/book/:space/reference/:reference",
    authorizeApi,
    asyncHandler(deleteBookByReference)
  );
};
