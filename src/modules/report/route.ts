import { asyncHandler } from "../../handler";
import { authorizeApi } from "../../middlewares";
import { generateReportForNote, generateReport, generateReportForBook } from "./service";

module.exports = function (router: any) {
  // router.get("/report/:space/:noteRef", authorizeApi, asyncHandler(generateReportForNote))
  router.get(
    "/report/:space/:noteRef",
    authorizeApi,
    asyncHandler(generateReportForNote)
  );
  router.get("/report/:space", authorizeApi, asyncHandler(generateReport));
  router.get(
    "/report/book/:space/:bookref",
    authorizeApi,
    asyncHandler(generateReportForBook)
  );
};
