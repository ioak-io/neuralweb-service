const express = require("express");
const router = express.Router();

router.get("/", (_: any, res: any) => {
  res.send("v1.0.0");
  res.end();
});

require("./modules/hello/route")(router);
require("./modules/auth/route")(router);
require("./modules/note/route")(router);
require("./modules/note/tag/route")(router);
require("./modules/user/route")(router);
require("./modules/user/invite/route")(router);
require("./modules/company/route")(router);
require("./modules/notelink/route")(router);
require("./modules/notelink/auto/route")(router);
require("./modules/book/route")(router);
require("./modules/book/chapter/route")(router);
require("./modules/book/section/route")(router);
require("./modules/book/sectiondetail/route")(router);
require("./modules/book/concept/route")(router);
require("./modules/book/conceptdetail/route")(router);
require("./modules/book/theme/route")(router);
require("./modules/book/themedetail/route")(router);
require("./modules/book/subtheme/route")(router);
require("./modules/book/shortform/route")(router);
require("./modules/book/extract/route")(router);
require("./modules/book/log/route")(router);
require("./modules/import/route")(router);
require("./modules/import/log/route")(router);
require("./modules/colorfilter/route")(router);
require("./modules/metadata/definition/route")(router);
require("./modules/metadata/value/route")(router);
require("./modules/stopwords/route")(router);
require("./modules/keywords/route")(router);
require("./modules/label/route")(router);
require("./modules/report/route")(router);
require("./modules/flashcard/route")(router);

module.exports = router;
