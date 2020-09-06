const express = require("express");
const router = express.Router();

const editor = require("../../controllers/cms/editor.controller");
const editor_controller = new editor();

router.post("/upload-image-editor", (req, res) => {
  editor_controller.Upload_image(req, res);
});

module.exports = router;
