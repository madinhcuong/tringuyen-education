const express = require("express");
const router = express.Router();

const { authorizedAdminByPermission } = require("../../helpers/_base_helpers");
const chart = require("../../controllers/cms/chart.controller");
const chart_controller = new chart();

router.get(
  "/get-chart-by-year/:id",
  authorizedAdminByPermission("READ_STATISTIC"),
  (req, res) => {
    chart_controller.GetChartByYear(req, res);
  }
);

router.get(
  "/get-chart-by-month",
  authorizedAdminByPermission("READ_STATISTIC"),
  (req, res) => {
    chart_controller.GetChartByMonth(req, res);
  }
);

router.get(
  "/get-total-statistic",
  authorizedAdminByPermission("READ_STATISTIC"),
  (req, res) => {
    chart_controller.GetTotalStatistics(req, res);
  }
);

router.get(
  "/get-statistic-by-date",
  authorizedAdminByPermission("READ_STATISTIC"),
  (req, res) => {
    chart_controller.GetStatisticsByDate(req, res);
  }
);

module.exports = router;
