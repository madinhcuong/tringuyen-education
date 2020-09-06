const express = require("express");
const router = express.Router();
const upload = require("../../controllers/cms/upload.controller");
const Upload_Image = new upload();

router.post("/upload-image", (req, res) => {
  Upload_Image.Upload_image(req, res);
});

router.get("/get-list-image-unused", (req, res) => {
  Upload_Image.GetListImageUnused(req, res);
});

router.post("/delete-file-unused", (req, res) => {
  Upload_Image.DeleteFileUnused(req, res);
});

module.exports = router;
