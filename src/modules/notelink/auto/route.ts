import { asyncHandler } from "../../../handler";
import { authorizeApi } from "../../../middlewares";
import {
  getNotelinkAuto,
} from "./service";

const selfRealm = 100;

module.exports = function (router: any) {
  router.get("/notelink-auto/:space", authorizeApi, asyncHandler(getNotelinkAuto));
};
