import { asyncHandler } from "../../handler";
import { authorizeApi } from "../../middlewares";
import {
  getKeywords,
} from "./service";

const selfRealm = 100;

module.exports = function (router: any) {
  router.get("/keywords/:space", authorizeApi, asyncHandler(getKeywords));
};
