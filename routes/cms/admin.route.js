const express = require("express");
const router = express.Router();

const { authorizedAdminByPermission } = require("../../helpers/_base_helpers");
const Admin = require("../../controllers/cms/admin.controller");
const Admin_controller = new Admin();

router.get(
  "/cms/get-list-admin",
  authorizedAdminByPermission("READ_ADMINROLE"),
  (req, res) => {
    Admin_controller.GetListAdmin(req, res);
  }
);

router.get("/infor-admin", (req, res) => {
  Admin_controller.InforAdmin(req, res);
});

router.put("/update-password", (req, res) => {
  Admin_controller.UpdatePassWord(req, res);
});

router.put("/update-infor", (req, res) => {
  Admin_controller.UpdateInforUser(req, res);
});

module.exports = router;
