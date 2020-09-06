const express = require("express");
const router = express.Router();

const { authorizedAdminByPermission } = require("../../helpers/_base_helpers");
const diploma = require("../../controllers/cms/diploma.controller");
const diploma_controller = new diploma();

router.get(
  "/get-list-diploma",
  authorizedAdminByPermission("READ_DIPLOMA"),
  (req, res) => {
    diploma_controller.GetListDiploma(req, res);
  }
);

router.get(
  "/get-diploma-by-id/:id",
  authorizedAdminByPermission("READ_DIPLOMA"),
  (req, res) => {
    diploma_controller.GetDiplomaById(req, res);
  }
);

module.exports = router;
