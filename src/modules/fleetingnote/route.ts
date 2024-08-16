import { asyncHandler } from "../../handler";
import { authorizeApi } from "../../middlewares";
import {
  updateFleetingnote,
  getFleetingnotes,
  searchFleetingnote,
  getFleetingnoteDictionary,
  getFleetingnoteById,
  getFleetingnoteByReference,
  deleteFleetingnote,
  getRecentlyCreatedFleetingnote,
  deleteFleetingnoteByReference,
  getFleetingnotesByMetadataValue
} from "./service";

const selfRealm = 100;

module.exports = function (router: any) {
  router.put("/fleetingnote/:space", authorizeApi, asyncHandler(updateFleetingnote));
  // router.get("/fleetingnote/:space", authorizeApi, asyncHandler(getFleetingnote));
  router.post("/fleetingnote/:space/search", authorizeApi, asyncHandler(searchFleetingnote));
  router.post("/fleetingnote/:space/metadata/:metadataId", authorizeApi, asyncHandler(getFleetingnotesByMetadataValue));
  router.get(
    "/fleetingnote/:space/dictionary",
    authorizeApi,
    asyncHandler(getFleetingnoteDictionary)
  );
  router.get(
    "/fleetingnote/:space",
    authorizeApi,
    asyncHandler(getFleetingnotes)
  );
  router.get(
    "/fleetingnote/:space/recently-created",
    authorizeApi,
    asyncHandler(getRecentlyCreatedFleetingnote)
  );
  router.get("/fleetingnote/:space/id/:id", authorizeApi, asyncHandler(getFleetingnoteById));
  router.get(
    "/fleetingnote/:space/reference/:reference",
    authorizeApi,
    asyncHandler(getFleetingnoteByReference)
  );
  router.delete("/fleetingnote/:space/:id", authorizeApi, asyncHandler(deleteFleetingnote));
  router.delete("/fleetingnote/:space/reference/:reference", authorizeApi, asyncHandler(deleteFleetingnoteByReference));
  // router.post("/auth/token", issueToken);
  // router.get("/auth/token/decode", authorizeApi, decodeToken);
  // router.post("/auth/logout", logout);
  // router.get("/auth/oa/session/:id", (req: any, res: any) =>
  //   validateSession(selfRealm, req, res)
  // );
};
