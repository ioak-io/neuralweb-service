import { asyncHandler } from "../../handler";
import { authorizeApi } from "../../middlewares";
import {
  updateNote,
  getNote,
  searchNote,
  getNoteDictionary,
  getNoteById,
  getNoteByReference,
  deleteNote,
  getRecentlyCreatedNote
} from "./service";

const selfRealm = 100;

module.exports = function (router: any) {
  router.put("/note/:space", authorizeApi, asyncHandler(updateNote));
  router.get("/note/:space", authorizeApi, asyncHandler(getNote));
  router.post("/note/:space/search", authorizeApi, asyncHandler(searchNote));
  router.get(
    "/note/:space/dictionary",
    authorizeApi,
    asyncHandler(getNoteDictionary)
  );
  router.get(
    "/note/:space/recently-created",
    authorizeApi,
    asyncHandler(getRecentlyCreatedNote)
  );
  router.get("/note/:space/id/:id", authorizeApi, asyncHandler(getNoteById));
  router.get(
    "/note/:space/reference/:reference",
    authorizeApi,
    asyncHandler(getNoteByReference)
  );
  router.delete("/note/:space/:id", authorizeApi, asyncHandler(deleteNote));
  // router.post("/auth/token", issueToken);
  // router.get("/auth/token/decode", authorizeApi, decodeToken);
  // router.post("/auth/logout", logout);
  // router.get("/auth/oa/session/:id", (req: any, res: any) =>
  //   validateSession(selfRealm, req, res)
  // );
};
