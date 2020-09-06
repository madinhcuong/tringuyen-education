const express = require("express");
const router = express.Router();

const { authorizedAdminByPermission } = require("../../helpers/_base_helpers");
const inforTraining = require("../../controllers/cms/inforTraining.controller");
const InforTraining_controller = new inforTraining();

router.get(
  "/get-list-infor-training",
  authorizedAdminByPermission("READ_INFORTRAINING"),
  (req, res) => {
    InforTraining_controller.GetListInforTraining(req, res);
  }
);

router.get(
  "/get-infor-training-by-id/:id",
  authorizedAdminByPermission("READ_INFORTRAINING"),
  (req, res) => {
    InforTraining_controller.GetInforTrainingById(req, res);
  }
);

router.post(
  "/create-infor-training",
  authorizedAdminByPermission("CREATE_INFORTRAINING"),
  (req, res) => {
    InforTraining_controller.CreateInforTraining(req, res);
  }
);

router.put(
  "/edit-infor-training/:id",
  authorizedAdminByPermission("UPDATE_INFORTRAINING"),
  (req, res) => {
    InforTraining_controller.EditInforTraining(req, res);
  }
);

module.exports = router;

// "READ_INFORTRAINING",
//     "CREATE_INFORTRAINING",
//     "UPDATE_INFORTRAINING"
