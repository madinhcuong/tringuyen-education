const express = require("express");
const router = express.Router();
const training = require("../../controllers/web/training.controller");
const training_controller = new training();

router.get("/get-list-training", (req, res) => {
  training_controller.GetListTraining(req, res);
});

module.exports = router;
