import { asyncHandler } from "../../handler";
import {
  train_similarity_model
} from "./service";

module.exports = function (router: any) {
  router.get("/api/hello", (_: any, res: any) => {
    res.send(
      "basic connection to server works. database connection is not validated"
    );
    res.end();
  });

  router.get(
    "/api/hello/:space/train",
    asyncHandler(train_similarity_model)
  );
};
