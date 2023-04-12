const express = require("express");
const router = express.Router();

router.get("/", (_: any, res: any) => {
  res.send("v1.0.0");
  res.end();
});

require("./modules/hello/route")(router);
require("./modules/auth/route")(router);
require("./modules/note/route")(router);
require("./modules/folder/route")(router);
require("./modules/user/route")(router);
require("./modules/user/invite/route")(router);
require("./modules/company/route")(router);
require("./modules/expense/route")(router);
require("./modules/income/route")(router);
require("./modules/category/route")(router);
require("./modules/incomecategory/route")(router);
require("./modules/note/tag/route")(router);
require("./modules/notelink/route")(router);
require("./modules/bill/route")(router);
require("./modules/budget/route")(router);
require("./modules/schedule/receipt/route")(router);
require("./modules/schedule/receipt/log/route")(router);
require("./modules/import/route")(router);
require("./modules/import/log/route")(router);
require("./modules/filter-group/route")(router);
require("./modules/statistics/route")(router);
require("./modules/account/route")(router);
require("./modules/account/scope/route")(router);
require("./modules/metadata/definition/route")(router);
require("./modules/metadata/value/route")(router);
require("./modules/label/route")(router);

module.exports = router;
