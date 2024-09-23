import { asyncHandler } from "../../../handler";
import { authorizeApi } from "../../../middlewares";
import { getLog } from "./service";

module.exports = function (router: any) {
  router.get("/book/log/:space/:bookref", authorizeApi, asyncHandler(getLog));
  router.get(
    "/book/log/:space/:bookref/:sectionref",
    authorizeApi,
    asyncHandler(getLog)
  );
  router.get(
    "/book/log/:space/:bookref/:sectionref/:sectiontype",
    authorizeApi,
    asyncHandler(getLog)
  );
};
