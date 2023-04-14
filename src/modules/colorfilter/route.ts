import { asyncHandler } from "../../handler";
import { authorizeApi } from "../../middlewares";
import {
  updateColorfilter,
  getColorfilter,
  deleteColorfilter,
  moveDown,
  moveUp
} from "./service";

const selfRealm = 100;

module.exports = function (router: any) {
  router.put("/color-filter/:space", authorizeApi, asyncHandler(updateColorfilter));
  router.get("/color-filter/:space", authorizeApi, asyncHandler(getColorfilter));
  router.delete("/color-filter/:space/:id", authorizeApi, asyncHandler(deleteColorfilter));
  router.post("/color-filter/:space/up/:id", authorizeApi, asyncHandler(moveUp));
  router.post("/color-filter/:space/down/:id", authorizeApi, asyncHandler(moveDown));
};
