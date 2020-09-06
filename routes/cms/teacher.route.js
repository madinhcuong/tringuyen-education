const express = require("express");
const router = express.Router();

const { authorizedAdminByPermission } = require("../../helpers/_base_helpers");
const teacher = require("../../controllers/cms/teacher.controller");
const Teacher_controller = new teacher();

router.get(
  "/get-infor-teacher",
  authorizedAdminByPermission("READ_TEACHER"),
  (req, res) => {
    Teacher_controller.GetInforTeacher(req, res);
  }
);

router.get(
  "/get-teacher-by-id/:id",
  authorizedAdminByPermission("READ_TEACHER"),
  (req, res) => {
    Teacher_controller.GetTeacherById(req, res);
  }
);

router.post(
  "/create-teacher",
  authorizedAdminByPermission("CREATE_TEACHER"),
  (req, res) => {
    Teacher_controller.CreateTeacher(req, res);
  }
);

router.put(
  "/update-status-teacher/:id",
  authorizedAdminByPermission("UPDATE_TEACHER"),
  (req, res) => {
    Teacher_controller.UpdateStatus(req, res);
  }
);

router.put(
  "/update-teacher/:id",
  authorizedAdminByPermission("UPDATE_TEACHER"),
  (req, res) => {
    Teacher_controller.UpdateTeacher(req, res);
  }
);

router.get(
  "/get-list-teacher-by-id-class/:id",
  (req, res) => {
    Teacher_controller.GetTeacherByIdClass(req, res);
  }
);

module.exports = router;
