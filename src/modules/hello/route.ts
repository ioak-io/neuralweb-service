import { asyncHandler } from "../../handler";
import {
  train_similarity_model
} from "./service";

module.exports = function (router: any) {
  router.get("/admin", (_: any, res: any) => {
    res.send(
      "basic connection to server works. database connection is not validated"
    );
    res.end();
  });

  router.get(
    "/admin/:space/train",
    asyncHandler(train_similarity_model)
  );
};
