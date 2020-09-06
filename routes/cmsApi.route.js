var express = require("express");
var router = express.Router();
const { adminAuthMiddleware } = require("../helpers/admin.helpers");

router.use("/", [
  require("./cms/_auth.route"),
  require("./cms/resetPassWord.route"),
  require("./cms/exportExcel.route"),
  require("./cms/editor.route"),
]);

router.use("/", adminAuthMiddleware, [
  require("./cms/admin.route"),
  require("./cms/adminRole.route"),
  require("./cms/news.route"),
  require("./cms/training.route"),
  require("./cms/topic.route"),
  require("./cms/staff.route"),
  require("./cms/teacher.route"),
  require("./cms/upload.route"),
  require("./cms/inforTraining.route"),
  require("./cms/courses.route"),
  require("./cms/logs.route"),
  require("./cms/class.route"),
  require("./cms/student.route"),
  require("./cms/registeredLearn.route"),
  require("./cms/scoreCumulative.route"),
  require("./cms/chart.route"),
  require("./cms/notification.route"),
  require("./cms/diploma.route"),
  require("./cms/pay.route"),
]);

module.exports = router;
