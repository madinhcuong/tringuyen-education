const express = require("express");
const router = express.Router();

const { authorizedAdminByPermission } = require("../../helpers/_base_helpers");
const courses = require("../../controllers/cms/courses.controller");
const Courses_controller = new courses();

router.get(
  "/get-list-courses",
  authorizedAdminByPermission("READ_COURSES"),
  (req, res) => {
    Courses_controller.GetListCourses(req, res);
  }
);

router.get(
  "/get-list-courses-no-permission",
  (req, res) => {
    Courses_controller.GetListCourses_NoPermission(req, res);
  }
);

router.get(
  "/get-course-by-id/:id",
  authorizedAdminByPermission("READ_COURSES"),
  (req, res) => {
    Courses_controller.GetCoursesByID(req, res);
  }
);

router.post(
  "/create-courses",
  authorizedAdminByPermission("CREATE_COURSES"),
  (req, res) => {
    Courses_controller.CreateCourses(req, res);
  }
);

router.put(
  "/edit-courses/:id",
  authorizedAdminByPermission("UPDATE_COURSES"),
  (req, res) => {
    Courses_controller.UpdateCourses(req, res);
  }
);

router.put(
  "/edit-status-courses/:id",
  authorizedAdminByPermission("UPDATE_COURSES"),
  (req, res) => {
    Courses_controller.UpdateStatusCourses(req, res);
  }
);

module.exports = router;
