import { asyncHandler } from "../../../handler";
import { authorizeApi } from "../../../middlewares";
import {
  getMetadataValue,
} from "./service";

const selfRealm = 100;

module.exports = function (router: any) {
  router.get("/metadata-value/:space", authorizeApi, asyncHandler(getMetadataValue));
};
