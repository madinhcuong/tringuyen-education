const express = require("express");
const router = express.Router();

const { authorizedAdminByPermission } = require("../../helpers/_base_helpers");
const student = require("../../controllers/cms/student.controller");
const student_controller = new student();

router.get(
  "/get-list-student",
  authorizedAdminByPermission("READ_STUDENT"),
  (req, res) => {
    student_controller.GetListStudent(req, res);
  }
);

router.get(
  "/get-student-by-id/:id",
  authorizedAdminByPermission("READ_STUDENT"),
  (req, res) => {
    student_controller.GetStudentById(req, res);
  }
);

router.get(
  "/get-class-student-by-id/:id",
  authorizedAdminByPermission("READ_STUDENT"),
  (req, res) => {
    student_controller.GetClassStuentById(req, res);
  }
);

router.post(
  "/create-student",
  authorizedAdminByPermission("CREATE_STUDENT"),
  (req, res) => {
    student_controller.CreateStudent(req, res);
  }
);

router.put(
  "/update-student/:id",
  authorizedAdminByPermission("UPDATE_STUDENT"),
  (req, res) => {
    student_controller.UpdateStudent(req, res);
  }
);

module.exports = router;

"READ_STUDENT", "CREATE_STUDENT", "UPDATE_STUDENT";
