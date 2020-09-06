const express = require("express");
const router = express.Router();

const student = require("../../controllers/client/forgotPassword.controller");
const student_controller = new student();

router.post("/send-mail-reset-password", (req, res) => {
    student_controller.SendmailKeyForgotPassWord(req, res);
});

router.post("/reset-password", (req, res) => {
    student_controller.ResetForgotPassWord(req, res);
});

module.exports = router;
