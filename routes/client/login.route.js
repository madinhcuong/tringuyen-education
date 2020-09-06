const express = require("express");
const router = express.Router();

const login = require("../../controllers/client/login.controller");
const login_controller = new login();

router.post("/login", (req, res) => {
  login_controller.LoginStudent(req, res);
});

module.exports = router;
