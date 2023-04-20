import { asyncHandler } from "../../handler";
import { authorizeApi } from "../../middlewares";
import { generateReportForNote, generateReport } from "./service";

module.exports = function (router: any) {
  // router.get("/report/:space/:noteRef", authorizeApi, asyncHandler(generateReportForNote))
  router.get("/report/:space/:noteRef/test", asyncHandler(generateReportForNote))
  router.get("/report/:space/test", asyncHandler(generateReport))
}
