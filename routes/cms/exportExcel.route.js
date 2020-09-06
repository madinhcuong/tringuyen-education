const express = require("express");
const router = express.Router();

const chart = require("../../controllers/cms/chart.controller");
const chart_controller = new chart();

const _class = require("../../controllers/cms/class.controller");
const Class_controller = new _class();

router.get("/export-score-student/:id", (req, res) => {
  Class_controller.ExportExcelScoreStudent(req, res);
});

// xuât excel
router.get("/export-excel-statistic-by-date", (req, res) => {
  chart_controller.exportExcelStatisticsByDate(req, res);
});

module.exports = router;
