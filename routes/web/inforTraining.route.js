const express = require("express");
const router = express.Router();
const inforTraining = require("../../controllers/web/inforTraining.controller");
const inforTrainingcontroller = new inforTraining();

router.get("/get-list-infortraining-by-id/:id", (req, res) => {
  inforTrainingcontroller.GetListInforTrainingById(req, res);
});

router.get("/get-infortraining-by-id/:id", (req, res) => {
  inforTrainingcontroller.GetInforTrainingById(req, res);
});

module.exports = router;
