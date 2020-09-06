const express = require("express");
const router = express.Router();

const { authorizedAdminByPermission } = require("../../helpers/_base_helpers");
const noti = require("../../controllers/cms/notification.controller");
const noti_controller = new noti();

router.get(
  "/get-list-noti",
  authorizedAdminByPermission("READ_NOTI"),
  (req, res) => {
    noti_controller.GetListNoti(req, res);
  }
);

router.put(
  "/check-click-noti",
  authorizedAdminByPermission("READ_NOTI"),
  (req, res) => {
    noti_controller.CheckClickNoti(req, res);
  }
);

module.exports = router;
