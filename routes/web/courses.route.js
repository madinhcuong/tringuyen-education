const express = require("express");
const router = express.Router();
const courses = require("../../controllers/web/courses.controller");
const courses_controller = new courses();

router.get("/get-list-courses", function(req, res) {
  courses_controller.GetListCourses(req, res);
});

router.get("/get-class-byid/:id", function(req, res) {
  courses_controller.GetClassById(req, res);
});

module.exports = router;
