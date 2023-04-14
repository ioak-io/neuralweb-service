import { asyncHandler } from "../../handler";
import { authorizeApi } from "../../middlewares";
import {
  getNotelink,
  saveNotelink,
  deleteNotelink
} from "./service";

const selfRealm = 100;

module.exports = function (router: any) {
  router.get("/notelink/:space", authorizeApi, asyncHandler(getNotelink));
  router.post(
    "/notelink/:space/:sourceReference/:linkedReference",
    authorizeApi,
    asyncHandler(saveNotelink)
  );
  router.delete(
    "/notelink/:space/:sourceReference/:linkedReference",
    authorizeApi,
    asyncHandler(deleteNotelink)
  );
};
