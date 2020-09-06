const fs = require("fs");
const { _extend } = require("util");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
const uuidv4 = require("uuid/v4");
const {
  responseOk,
  responseError,
  slug,
  ImportImages,
} = require("../../helpers/_base_helpers");
const cloudinary_helpers = require("../../helpers/cloudinary.helpers");
const student_model = require("../../models/student.model");
const fileUpload_model = require("../../models/fileUpload.model");

cloudinary.config(cloudinary_helpers.config_cloudinary);

class Student {
  async inforStudent(req, res) {
    try {
      return responseOk(
        res,
        req.authenticatedClient ? req.authenticatedClient : {}
      );
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async UpdateInforUser(req, res) {
    try {
      let body = _extend({}, req.body);

      let id_user = req.authenticatedClient ? req.authenticatedClient._id : "";
      if (!id_user || id_user == "")
        return responseError(res, 400, 68, "USER_NOT_FOUND");

      let update_user = await student_model.findByIdAndUpdate(id_user, body, {
        new: true,
      });
      if (!update_user) return responseError(res, 400, 68, "USER_NOT_FOUND");

      return responseOk(res, "UPDATE_SUCCESS");
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  // thông tin người giới thiệu
  async inforAgentCode(req, res) {
    try {
      let data_agent = {};
      if (req.authenticatedClient.agent_code) {
        data_agent = await student_model
          .findOne({ your_agent: req.authenticatedClient.agent_code })
          .select("image your_agent name sex email phone sex date address");
      }

      return responseOk(res, data_agent);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async UpdatePassWord(req, res) {
    try {
      let body = _extend({}, req.body);

      let data_user = await student_model
        .findById(req.authenticatedClient._id)
        .select("password");

      let data_pass = bcrypt.compareSync(
        slug(body.password),
        data_user.password
      );

      if (!data_pass) return responseError(res, 400, 66, "PASS_WORD_WRONG");

      let data = await student_model.findByIdAndUpdate(
        req.authenticatedClient._id,
        {
          password: bcrypt.hashSync(slug(body.newpassword), 10),
        }
      );

      return responseOk(res, "UPDATE_SUCCESS");
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  //-- upload image cloudinary
  // async Upload_image(req, res) {
  //   try {
  //     let body = _extend({}, req.body);
  //     let path_name = await ImportImages(req, res);

  //     let uuid = uuidv4();

  //     await cloudinary.uploader.upload(
  //       path_name,
  //       { public_id: `tringuyen/${uuid}`, tags: `tringuyen` }, // directory and tags are optional
  //       async (err, image) => {
  //         if (err) return responseError(res, 400, 78, "UPLOAD_IMAGE_FAIL");

  //         let path_name_save = await image.url.split("/").slice(3).join("/");

  //         fs.unlinkSync(path_name);
  //         return responseOk(res, path_name_save);
  //       }
  //     );
  //   } catch (err) {
  //     console.log(err);
  //     return responseError(res, 500, 0, "ERROR");
  //   }
  // }

  //-- upload image server

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
}

module.exports = Student;
