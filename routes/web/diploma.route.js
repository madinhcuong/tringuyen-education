const express = require("express");
const router = express.Router();
const diploma = require("../../controllers/web/diploma.controller");
const diploma_controller = new diploma();

router.get("/get-infor-diploma/:code", (req, res) => {
  diploma_controller.GetInforDiploma(req, res);
});

module.exports = router;
