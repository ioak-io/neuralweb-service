import { asyncHandler } from "../../handler";
import { authorizeApi } from "../../middlewares";
import { importFileForFlashcard } from "./service";
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = function (router: any) {
  router.post(
    "/flashcard/:space/upload",
    upload.array("files"),
    authorizeApi,
    asyncHandler(importFileForFlashcard)
  );
};
