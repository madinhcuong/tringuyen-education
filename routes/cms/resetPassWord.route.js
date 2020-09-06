const express = require("express");
const router = express.Router();

const admin = require("../../controllers/cms/resetPassWord.controller");
const Admin_controller = new admin();

router.post("/send-mail-reset-password", (req, res) => {
  Admin_controller.SendmailKeyForgotPassWord(req, res);
});

router.post("/reset-password", (req, res) => {
  Admin_controller.ResetForgotPassWord(req, res);
});

module.exports = router;
