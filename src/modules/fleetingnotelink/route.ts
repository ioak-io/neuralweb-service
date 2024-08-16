import { asyncHandler } from "../../handler";
import { authorizeApi } from "../../middlewares";
import {
  getFleetingnotelink,
} from "./service";

const selfRealm = 100;

module.exports = function (router: any) {
  router.get("/fleetingnotelink/:space", authorizeApi, asyncHandler(getFleetingnotelink));
};
