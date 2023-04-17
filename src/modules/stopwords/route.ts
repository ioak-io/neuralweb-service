import { asyncHandler } from "../../handler";
import { authorizeApi } from "../../middlewares";
import {
  getStopwords,
  resetStopwords,
  toggleStopword,
  deleteStopword
} from "./service";

const selfRealm = 100;

module.exports = function (router: any) {
  router.post("/stopwords/:space", authorizeApi, asyncHandler(toggleStopword));
  router.post("/stopwords/:space/reset", authorizeApi, asyncHandler(resetStopwords));
  router.get("/stopwords/:space", authorizeApi, asyncHandler(getStopwords));
  router.delete("/stopwords/:space/:id", authorizeApi, asyncHandler(deleteStopword));
};
