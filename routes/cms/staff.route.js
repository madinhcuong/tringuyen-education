const express = require("express");
const router = express.Router();

const { authorizedAdminByPermission } = require("../../helpers/_base_helpers");
const training = require("../../controllers/cms/staff.controller");
const Staff_controller = new training();

router.get(
  "/get-infor-staff",
  authorizedAdminByPermission("READ_ADMIN"),
  (req, res) => {
    Staff_controller.GetInforStaff(req, res);
  }
);

router.get(
  "/get-staff-by-id/:id",
  authorizedAdminByPermission("READ_ADMIN"),
  (req, res) => {
    Staff_controller.GetStaffById(req, res);
  }
);

router.post(
  "/create-staff",
  authorizedAdminByPermission("CREATE_ADMIN"),
  (req, res) => {
    Staff_controller.CreateStaff(req, res);
  }
);

router.put(
  "/update-staff/:id",
  authorizedAdminByPermission("UPDATE_ADMIN"),
  (req, res) => {
    Staff_controller.UpdateStaff(req, res);
  }
);

router.put(
  "/update-status-staff/:id",
  authorizedAdminByPermission("UPDATE_ADMIN"),
  (req, res) => {
    Staff_controller.UpdateStatusStaff(req, res);
  }
);

// router.post('/create-training', authorizedAdminByPermission('UPDATE_ADMIN'), (req, res) => {
//     Training_controller.CreateTraining(req, res);
// })

// router.put('/update-training/:id', authorizedAdminByPermission('UPDATE_TRAINING'), (req, res) => {
//     Training_controller.UpdateTraining(req, res);
// })

// router.delete('/delete-training/:id', authorizedAdminByPermission('DELETE_TRAINING'), (req, res) => {
//     Training_controller.DeleteTraining(req, res);
// })

module.exports = router;

// "READ_ADMIN"
//                 },
//                 {
//                     label: "Tạo nhân viên",
//                     value: "CREATE_ADMIN"
//                 },
//                 {
//                     label: "Sửa nhân viên",
//                     value: "UPDATE_ADMIN"
//                 },
//                 {
//                     label: "Xóa nhân viên",
//                     value: "DELETE_ADMIN"
