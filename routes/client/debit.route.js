const express = require("express");
const router = express.Router();

const debit = require("../../controllers/client/debit.controller");
const debit_controller = new debit();

router.post("/score-money", (req, res) => {
  debit_controller.ChangeScoreMoney(req, res);
});

router.post("/score-discount", (req, res) => {
  debit_controller.ChangeScoreDiscount(req, res);
});

router.get("/get-list-discount", (req, res) => {
  debit_controller.GetListDiscounts(req, res);
});

router.get("/get-list-aff", (req, res) => {
  debit_controller.GetListAff(req, res);
});

router.post("/score-transfer", (req, res) => {
  debit_controller.ScoreTransfer(req, res);
});

// từ chối, xác nhận chuyen tien
router.put("/veri-score-transfer/:id_noti", (req, res) => {
  debit_controller.VeriScoreTransfer(req, res);
});

module.exports = router;
