import { asyncHandler } from "../../handler";
import { authorizeApi } from "../../middlewares";
import {
  updateNote,
  createNote,
  searchNote,
  getNoteDictionary,
  getNoteById,
  getNoteByReference,
  deleteNote,
  getRecentlyCreatedNote,
  deleteNoteByReference,
  getNotesByMetadataValue,
  browseNotes,
  deleteNoteByReferenceList,
  brainstormUsingAi,
} from "./service";

const selfRealm = 100;

module.exports = function (router: any) {
  router.put("/note/:space", authorizeApi, asyncHandler(updateNote));
  router.post("/note/:space", authorizeApi, asyncHandler(createNote));
  // router.get("/note/:space", authorizeApi, asyncHandler(getNote));
  router.post("/note/:space/search", authorizeApi, asyncHandler(searchNote));
  router.post(
    "/note/:space/metadata/:metadataId",
    authorizeApi,
    asyncHandler(getNotesByMetadataValue)
  );
  router.post("/note/:space/browse", authorizeApi, asyncHandler(browseNotes));
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
  router.post(
    "/note/:space/brainstorm",
    authorizeApi,
    asyncHandler(brainstormUsingAi)
  );
  router.get("/note/:space/id/:id", authorizeApi, asyncHandler(getNoteById));
  router.get(
    "/note/:space/reference/:reference",
    authorizeApi,
    asyncHandler(getNoteByReference)
  );
  router.delete("/note/:space/:id", authorizeApi, asyncHandler(deleteNote));
  router.post(
    "/note/:space/delete/byreference",
    authorizeApi,
    asyncHandler(deleteNoteByReferenceList)
  );
  router.delete(
    "/note/:space/reference/:reference",
    authorizeApi,
    asyncHandler(deleteNoteByReference)
  );
  // router.post("/auth/token", issueToken);
  // router.get("/auth/token/decode", authorizeApi, decodeToken);
  // router.post("/auth/logout", logout);
  // router.get("/auth/oa/session/:id", (req: any, res: any) =>
  //   validateSession(selfRealm, req, res)
  // );
};
