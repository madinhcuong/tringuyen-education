const express = require("express");
const router = express.Router();
const covid_19 = require("../../controllers/web/covid_19.controller");
const covid_19_controller = new covid_19();

router.get("/get-infor-covid19-vietnam", (req, res) => {
  covid_19_controller.GetInforCovid19VietNam(req, res);
});

router.get("/get-infor-covid19-world", (req, res) => {
  covid_19_controller.GetInforCovid19World(req, res);
});

module.exports = router;
