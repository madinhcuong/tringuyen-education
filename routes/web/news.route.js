const express = require("express");
const router = express.Router();
const news = require("../../controllers/web/news.controller");
const news_controller = new news();

router.get("/get-list-news-home", (req, res) => {
    news_controller.GetLisNewsHome(req, res);
});

router.get("/get-list-news-byid-topic/:id", (req, res) => {
    news_controller.GetListNewsByIdTopic(req, res);
});

router.get("/get-new-by-id/:id", (req, res) => {
    news_controller.GetNewsById(req, res);
});

router.get("/get-list-news-slider-home", (req, res) => {
    news_controller.GetListNewsSliderHome(req, res);
});

module.exports = router;
