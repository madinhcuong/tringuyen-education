const express = require("express");
const router = express.Router();

const student = require("../../controllers/client/student.controller");
const student_controller = new student();

router.get("/infor-student", (req, res) => {
  student_controller.inforStudent(req, res);
});

router.get("/infor-agent-code", (req, res) => {
  student_controller.inforAgentCode(req, res);
});

router.put("/update-infor", (req, res) => {
  student_controller.UpdateInforUser(req, res);
});

router.put("/update-password", (req, res) => {
  student_controller.UpdatePassWord(req, res);
});

router.post("/upload-image", (req, res) => {
  student_controller.Upload_image(req, res);
});

module.exports = router;
