const express = require("express");
const router = express.Router();

const { authorizedAdminByPermission } = require("../../helpers/_base_helpers");
const logs = require("../../controllers/cms/logs.controller");
const Logs_controller = new logs();

router.get(
  "/get-list-logs",
  authorizedAdminByPermission("READ_LOGS"),
  (req, res) => {
    Logs_controller.GetListLogs(req, res);
  }
);

module.exports = router;