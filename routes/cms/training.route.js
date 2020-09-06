const express = require("express");
const router = express.Router();

const { authorizedAdminByPermission } = require("../../helpers/_base_helpers");
const training = require("../../controllers/cms/training.controller");
const Training_controller = new training();

router.get(
  "/get-infor-training",
  authorizedAdminByPermission("READ_TRAINING"),
  (req, res) => {
    Training_controller.GetInforTraining(req, res);
  }
);

router.get("/get-list-training-by-teacher", (req, res) => {
  Training_controller.GetListTrainingByTeacher(req, res);
});

router.post(
  "/create-training",
  authorizedAdminByPermission("CREATE_TRAINING"),
  (req, res) => {
    Training_controller.CreateTraining(req, res);
  }
);

router.put(
  "/update-training/:id",
  authorizedAdminByPermission("UPDATE_TRAINING"),
  (req, res) => {
    Training_controller.UpdateTraining(req, res);
  }
);

// router.delete(
//   "/delete-training/:id",
//   authorizedAdminByPermission("DELETE_TRAINING"),
//   (req, res) => {
//     Training_controller.DeleteTraining(req, res);
//   }
// );

module.exports = router;
