const express = require("express");
const router = express.Router();

const { authorizedAdminByPermission } = require("../../helpers/_base_helpers");
const news = require("../../controllers/cms/news.controller");
const News_controller = new news();

router.get(
  "/get-infor-news",
  authorizedAdminByPermission("READ_NEWS"),
  (req, res) => {
    News_controller.GetInforNews(req, res);
  }
);

router.get(
  "/get-news-by-id/:id",
  authorizedAdminByPermission("READ_NEWS"),
  (req, res) => {
    News_controller.GetNewsById(req, res);
  }
);

router.post(
  "/create-news",
  authorizedAdminByPermission("CREATE_NEWS"),
  (req, res) => {
    News_controller.CreateNews(req, res);
  }
);

router.put(
  "/edit-news/:id",
  authorizedAdminByPermission("UPDATE_NEWS"),
  (req, res) => {
    News_controller.EditNews(req, res);
  }
);

router.delete(
  "/delete-news/:id",
  authorizedAdminByPermission("DELETE_NEWS"),
  (req, res) => {
    News_controller.DeleteNews(req, res);
  }
);

module.exports = router;
