const express = require("express");
const router = express.Router();
const Topic = require("../../controllers/cms/topic.controller");
const Topic_controller = new Topic();

const { authorizedAdminByPermission } = require("../../helpers/_base_helpers");

router.get(
  "/get-infor-topic",
  authorizedAdminByPermission("READ_TOPIC"),
  (req, res) => {
    Topic_controller.getInforTopic(req, res);
  }
);

router.get("/get-list-topic-by-news", (req, res) => {
  Topic_controller.GetListTopicByNews(req, res);
});

router.get(
  "/get-topic-by-id/:id",
  authorizedAdminByPermission("READ_TOPIC"),
  (req, res) => {
    Topic_controller.GetTopicById(req, res);
  }
);

router.post(
  "/create-new-topic",
  authorizedAdminByPermission("CREATE_TOPIC"),
  (req, res) => {
    Topic_controller.CreateNewTopic(req, res);
  }
);

router.put(
  "/update-topic/:id",
  authorizedAdminByPermission("UPDATE_TOPIC"),
  (req, res) => {
    Topic_controller.UpdateTopic(req, res);
  }
);

router.delete(
  "/delete-topic/:id",
  authorizedAdminByPermission("DELETE_TOPIC"),
  (req, res) => {
    Topic_controller.DeleteTopic(req, res);
  }
);

module.exports = router;
