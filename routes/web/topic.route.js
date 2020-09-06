const express = require('express');
const router = express.Router();
const Topic = require('../../controllers/web/topic.controller');
const Topic_controller = new Topic();

router.get('/get-infor-topic', function (req, res) {
    Topic_controller.getInforTopic(req, res);
})

module.exports = router;
