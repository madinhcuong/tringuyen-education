const express = require("express");
const router = express.Router();

const { authorizedAdminByPermission } = require("../../helpers/_base_helpers");
const pay = require("../../controllers/cms/pay.controller");
const pay_controller = new pay();

router.get(
  "/get-list-pay",
  authorizedAdminByPermission("READ_PAY"),
  (req, res) => {
    pay_controller.GetListPay(req, res);
  }
);

router.get(
  "/get-pay-byId/:id",
  authorizedAdminByPermission("READ_PAY"),
  (req, res) => {
    pay_controller.GetPayById(req, res);
  }
);

router.put(
  "/update-pay/:id",
  authorizedAdminByPermission("UPDATE_PAY"),
  (req, res) => {
    pay_controller.UpdatePay(req, res);
  }
);

module.exports = router;

// "READ_PAY",
//  "UPDATE_PAY"
