const express = require("express");
const router = express.Router();
const RegisteredLearn = require("../../controllers/web/registerStudent.controller");
const RegisteredLearn_controller = new RegisteredLearn();

router.post("/create-student", (req, res) => {
  RegisteredLearn_controller.CreateStudent(req, res);
});

module.exports = router;
