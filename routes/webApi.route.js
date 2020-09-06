const express = require("express");
const router = express.Router();

router.use("/", [
  require("./web/topic.route"),
  require("./web/training.route"),
  require("./web/news.route"),
  require("./web/teacher.route"),
  require("./web/inforTraining.route"),
  require("./web/courses.route"),
  require("./web/registerStudent.route"),
  require("./web/diploma.route"),
  require("./web/payment.route"),
  require("./web/covid_19.route"),
]);

module.exports = router;
