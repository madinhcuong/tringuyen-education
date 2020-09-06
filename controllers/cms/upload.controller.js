const fs = require("fs");
const { _extend } = require("util");
const cloudinary = require("cloudinary").v2;
const uuidv4 = require("uuid/v4");
const {
  responseOk,
  responseError,
  ImportImages,
} = require("../../helpers/_base_helpers");
const cloudinary_helpers = require("../../helpers/cloudinary.helpers");

const fileUpload_model = require("../../models/fileUpload.model");
const admin_model = require("../../models/admin.model");
const student_model = require("../../models/student.model");
const infoTraining_model = require("../../models/inforTraining.model");
const news_model = require("../../models/news.model");

class Upload {
  // upload image cloudinary
  // cloudinary.config(cloudinary_helpers.config_cloudinary);
  //   async Upload_image(req, res) {
  //     try {
  //       let body = _extend({}, req.body);
  //       let path_name = await ImportImages(req, res);

  //       let uuid = uuidv4();

  //       await cloudinary.uploader.upload(
  //         path_name,
  //         { public_id: `tringuyen/${uuid}`, tags: `tringuyen` }, // directory and tags are optional
  //         async (err, image) => {
  //           if (err) return responseError(res, 400, 78, "UPLOAD_IMAGE_FAIL");

  //           let path_name_save = await image.url.split("/").slice(3).join("/");

  //           fs.unlinkSync(path_name);
  //           return responseOk(res, path_name_save);
  //         }
  //       );
  //     } catch (err) {
  //       console.log(err);
  //       return responseError(res, 500, 0, "ERROR");
  //     }
  //   }

  async Upload_image(req, res) {
    try {
      let body = _extend({}, req.body);
      let path_name = await ImportImages(req, res);
      if (path_name) {
        await new fileUpload_model({ path_name: path_name }).save();
      }
      return responseOk(res, path_name);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async GetListImageUnused(req, res) {
    try {
      let data_fileUpload = await fileUpload_model.find().select("path_name");
      let data_admin = await admin_model.find().select("avatar");
      let data_student = await student_model.find().select("image");
      let data_infoTraining = await infoTraining_model.find().select("image");
      let data_news = await news_model.find().select("image");

      let arr_image = [];
      for (let index of data_admin) {
        arr_image.push({ path_name: index.avatar });
      }
      for (let index of data_student) {
        arr_image.push({ path_name: index.image });
      }
      for (let index of data_infoTraining) {
        arr_image.push({ path_name: index.image });
      }
      for (let index of data_news) {
        arr_image.push({ path_name: index.image });
      }

      let results = data_fileUpload.filter(
        ({ path_name: id1 }) =>
          !arr_image.some(({ path_name: id2 }) => id2 === id1)
      );

      return responseOk(res, results);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async DeleteFileUnused(req, res) {
    try {
      let body = _extend({}, req.body);

      for (let item of body.data) {
        await fs.unlinkSync(item.path_name);
        await fileUpload_model.findByIdAndDelete(item._id);
      }

      return responseOk(res, "DELETE_SUCCESS");
    } catch (err) {
      console.error(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }
}
module.exports = Upload;
