const multer = require("multer");
// var upload = multer();

const storage = multer.memoryStorage();
const upload = multer({ storage });
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
  getCoverImages,
} from "./service";

module.exports = function (router: any) {
  router.put("/book/:space/:id", authorizeApi, asyncHandler(updateBook));
  router.post("/book/:space", authorizeApi, asyncHandler(createBook));
  router.post(
    "/book/:space/validate-book",
    authorizeApi,
    asyncHandler(validateBook)
  );
  // router.get("/book/:space", authorizeApi, asyncHandler(getBook));
  router.post("/book/:space/search", authorizeApi, asyncHandler(searchBook));
  router.get("/book/:space/reference/:reference/cover-images", authorizeApi, asyncHandler(getCoverImages));
  router.get("/book/:space", authorizeApi, asyncHandler(getLibraries));
  router.get("/book/:space/id/:id", authorizeApi, asyncHandler(getBookById));
  router.get(
    "/book/:space/reference/:reference",
    authorizeApi,
    asyncHandler(getBookByReference)
  );
  router.delete("/book/:space/:id", authorizeApi, asyncHandler(deleteBook));
  router.delete(
    "/book/:space/reference/:reference",
    authorizeApi,
    asyncHandler(deleteBookByReference)
  );
};
