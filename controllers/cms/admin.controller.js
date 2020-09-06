// const Joi = require('joi');
const bcrypt = require("bcrypt");
const { _extend } = require("util");
const jwt = require("jsonwebtoken");
const {
  responseOk,
  responseError,
  slug,
  savelogs,
} = require("../../helpers/_base_helpers");
const Admin_model = require("../../models/admin.model");

class Admin {
  async LoginAdmin(req, res) {
    let body = _extend({}, req.body);

    //   Joi.validate(data, err => {
    // if (err) {
    //     this.responseError(res, 422, err.message);
    // } else {
    await Admin_model.findOne({ email: body.username, status: "ACTIVATE" })
      .then(async (admin) => {
        if (
          !admin ||
          !bcrypt.compareSync(slug(body.password), admin.password)
        ) {
          return responseError(
            res,
            400,
            100,
            "Email and password does not match"
          );
        } else {
          jwt.sign(
            { admin },
            "secretkey",
            { expiresIn: "7 days" },
            (err, token) => {
              if (err) {
                return responseError(res, 500, 0, err.message);
              }

              savelogs(admin._id, "LOGIN", "Đăng nhập");
              return responseOk(res, { access_token: token });
            }
          );
        }
      })
      .catch((err) => {
        console.log(err);
        return responseError(res, 500, 0, err.message);
      });
    //   }
    //    });
  }

  async GetListAdmin(req, res) {
    try {
      let data = await Admin_model.find({});
      return responseOk(res, data);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, err.message);
    }
  }

  async InforAdmin(req, res) {
    try {
      let data = "";
      if (req.authenticatedAdmin) {
        data = {
          id: req.authenticatedAdmin._id,
          avatar: req.authenticatedAdmin.avatar,
          fullName: req.authenticatedAdmin.fullName,
          date: req.authenticatedAdmin.date,
          address: req.authenticatedAdmin.address,
          email: req.authenticatedAdmin.email,
          type: req.authenticatedAdmin.type,
          phone: req.authenticatedAdmin.phone,
          sex: req.authenticatedAdmin.sex,
          key_role: req.authenticatedAdmin.permissionGroup
            ? req.authenticatedAdmin.permissionGroup.key_role
            : "",
          no_change: req.authenticatedAdmin.permissionGroup
            ? req.authenticatedAdmin.permissionGroup.no_change
            : "",
          name: req.authenticatedAdmin.permissionGroup
            ? req.authenticatedAdmin.permissionGroup.name
            : "",
          id_permissions: req.authenticatedAdmin.permissionGroup
            ? req.authenticatedAdmin.permissionGroup._id
            : "",
          permissions: req.authenticatedAdmin.permissionGroup
            ? req.authenticatedAdmin.permissionGroup.permissions
            : "",
        };
      }
      return responseOk(res, data);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, err.message);
    }
  }

  async UpdatePassWord(req, res) {
    try {
      let body = _extend({}, req.body);

      let data_user = await Admin_model.findById(
        req.authenticatedAdmin._id
      ).select("password");

      let data_pass = bcrypt.compareSync(
        slug(body.password),
        data_user.password
      );

      if (!data_pass) return responseError(res, 400, 66, "PASS_WORD_WRONG");

      let data = await Admin_model.findByIdAndUpdate(
        req.authenticatedAdmin._id,
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

  async UpdateInforUser(req, res) {
    try {
      let id_user = req.authenticatedAdmin._id;
      let body = _extend({}, req.body);

      let data = await Admin_model.findByIdAndUpdate(id_user, body);
      if (!data) return responseError(res, 400, 68, "USER_NOT_FOUND");

      return responseOk(res, "UPDATE_SUCCESS");
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }
}

module.exports = Admin;
