const express = require("express");
const router = express.Router();

const pay = require("../../controllers/client/pay.controller");
const pay_controller = new pay();

router.post("/send-pay", (req, res) => {
  pay_controller.SendPay(req, res);
});

module.exports = router;
