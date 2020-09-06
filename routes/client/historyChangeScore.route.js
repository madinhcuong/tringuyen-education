const express = require("express");
const router = express.Router();

const historyChangesCore = require("../../controllers/client/historyChangeScore.controller");
const historyChangesCore_controller = new historyChangesCore();

router.get("/history-change-score", (req, res) => {
    historyChangesCore_controller.HistoryChangeScore(req, res);
});

module.exports = router;