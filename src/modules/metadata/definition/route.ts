import { asyncHandler } from "../../../handler";
import { authorizeApi } from "../../../middlewares";
import {
  updateMetadataDefinition,
  getMetadataDefinition,
  deleteMetadataDefinition,
} from "./service";

const selfRealm = 100;

module.exports = function (router: any) {
  router.post("/metadata-definition/:space/full", authorizeApi, asyncHandler(updateMetadataDefinition));
  router.get("/metadata-definition/:space", authorizeApi, asyncHandler(getMetadataDefinition));
  router.delete("/metadata-definition/:space/:id", authorizeApi, asyncHandler(deleteMetadataDefinition));
};
