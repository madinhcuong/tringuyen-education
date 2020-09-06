const express = require("express");
const router = express.Router();

const { authorizedAdminByPermission } = require("../../helpers/_base_helpers");
const adminRole = require("../../controllers/cms/adminRole.controller");
const AdminRole_controller = new adminRole();

router.get(
  "/get-list-add-permission",
  authorizedAdminByPermission("READ_ADMINROLE"),
  (req, res) => {
    AdminRole_controller.getListAddPermission(req, res);
  }
);

router.get(
  "/get-list-permission",
  authorizedAdminByPermission("READ_ADMINROLE"),
  (req, res) => {
    AdminRole_controller.getListPermission(req, res);
  }
);

router.get(
  "/get-list-role-by-teacher-staff",
  (req, res) => {
    AdminRole_controller.GetListRoleByTeacher_Staff(req, res);
  }
);

router.get(
  "/get-permission-by-id/:id",
  authorizedAdminByPermission("READ_ADMINROLE"),
  (req, res) => {
    AdminRole_controller.getPermissionById(req, res);
  }
);

router.post(
  "/create-permission",
  authorizedAdminByPermission("CREATE_ADMINROLE"),
  (req, res) => {
    AdminRole_controller.CreatePermission(req, res);
  }
);

router.put(
  "/update-permission/:id",
  authorizedAdminByPermission("UPDATE_ADMINROLE"),
  (req, res) => {
    AdminRole_controller.UpdatePermission(req, res);
  }
);

// router.delete(
//   "/delete-permission/:id",
//   authorizedAdminByPermission("DELETE_ADMINROLE"),
//   (req, res) => {
//     AdminRole_controller.DeletePermission(req, res);
//   }
// );

module.exports = router;
