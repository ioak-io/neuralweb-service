import { asyncHandler } from "../../handler";
import { authorizeApi } from "../../middlewares";
import {
  getTrend,
  getWeeklyTrend,
  getMetric,
  getYearlyTrend,
  getBalanceTrend,
} from "./service";

const selfRealm = 100;

module.exports = function (router: any) {
  router.post("/statistics/:space/trend", authorizeApi, asyncHandler(getTrend));
  router.post(
    "/statistics/:space/weekly-trend",
    authorizeApi,
    asyncHandler(getWeeklyTrend)
  );
  router.post(
    "/statistics/:space/yearly-trend",
    authorizeApi,
    asyncHandler(getYearlyTrend)
  );
  router.post(
    "/statistics/:space/balance",
    authorizeApi,
    asyncHandler(getBalanceTrend)
  );
  router.post(
    "/statistics/:space/metric",
    authorizeApi,
    asyncHandler(getMetric)
  );
  // router.post("/auth/token", issueToken);
  // router.get("/auth/token/decode", authorizeApi, decodeToken);
  // router.post("/auth/logout", logout);
  // router.get("/auth/oa/session/:id", (req: any, res: any) =>
  //   validateSession(selfRealm, req, res)
  // );
};
