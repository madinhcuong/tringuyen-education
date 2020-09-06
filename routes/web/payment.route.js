const express = require("express");
const router = express.Router();
const payment = require("../../controllers/web/payment.controller");
const payment_controller = new payment();

router.post("/create-paypal", (req, res) => {
  payment_controller.CreatePaypal(req, res);
});

router.get("/success/:price", (req, res) => {
  payment_controller.PaypalSuccess(req, res);
});

router.get("/error", (req, res) => {
  payment_controller.PaypalError(req, res);
});

// --- VN_PAY ---//
router.post("/create-vnpay", (req, res) => {
  payment_controller.CreateVnpay(req, res);
});

router.get("/vnpay-return/:price", (req, res) => {
  payment_controller.Vnpay_return(req, res);
});

// --- END VN_PAY ---//

// --- MoMo ---//
router.post("/payment-momo", (req, res) => {
  payment_controller.paymentMoMo(req, res);
});

router.post("/ipn-payment-callback-momo", (req, res) => {
  payment_controller.ipnCallbackMoMo(req, res);
});

router.get("/payment-callback-momo/:price", function (req, res) {
  payment_controller.paymentCallbackMoMo(req, res);
});

// --- End MoMo ---//

module.exports = router;
