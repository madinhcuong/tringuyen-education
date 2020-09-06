const express = require("express");
const router = express.Router();

const noti = require("../../controllers/client/notification.controller");
const noti_controller = new noti();

router.get("/get-list-noti", (req, res) => {
  noti_controller.GetListNotiById(req, res);
});

router.get("/count-check-click-noti", (req, res) => {
  noti_controller.CountCheckClickNoti(req, res);
});

router.put("/check-click-noti", (req, res) => {
  noti_controller.CheckClickNoti(req, res);
});

router.put("/change-status-noti/:id", (req, res) => {
  noti_controller.ChangeStatusNoti(req, res);
});

router.get("/info-noti/:id", (req, res) => {
  noti_controller.InforNoti(req, res);
});

module.exports = router;
