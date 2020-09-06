const express = require("express");
const router = express.Router();
const teacher = require("../../controllers/web/teacher.controller");
const teacher_controller = new teacher();

router.get("/get-list-teacher", (req, res) => {
    teacher_controller.GetListTeacher(req, res);
});

module.exports = router;
