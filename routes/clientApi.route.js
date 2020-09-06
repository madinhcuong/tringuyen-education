const express = require("express");
const router = express.Router();
const { clientAuthMiddleware } = require("../helpers/client.helpers");

router.use("/", [
  require("./client/login.route"),
  require("./client/forgotPassword.route"),
]);

router.use("/", clientAuthMiddleware, [
  require("./client/student.route"),
  require("./client/class.route"),
  require("./client/debit.route"),
  require("./client/notification.route"),
  require("./client/pay.route"),
  require("./client/historyChangeScore.route"),
]);

module.exports = router;
