import { asyncHandler } from "../../handler";
import { authorizeApi } from "../../middlewares";
import { getLabel } from "./service";

const selfRealm = 100;

module.exports = function (router: any) {
  router.get("/label/:space", authorizeApi, asyncHandler(getLabel));
};
