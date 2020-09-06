const express = require("express");
const router = express.Router();

const _class = require("../../controllers/client/class.controller");
const _class_controller = new _class();

router.get("/schedule-class", (req, res) => {
    _class_controller.ScheduleClass(req, res);
});

router.get("/score-class", (req, res) => {
    _class_controller.ScoreClass(req, res);
});

module.exports = router;
