const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const { _extend } = require("util");
const {
  responseOk,
  responseError,
  create_key,
  slug,
} = require("../../helpers/_base_helpers");
const { teamplate_send_mail } = require("../../helpers/template_sendMail");
const { transporter_config } = require("../../config/nodemailer.config");
const student_model = require("../../models/student.model");

let transporter = nodemailer.createTransport(transporter_config);

class ResetPassWord {
  async SendmailKeyForgotPassWord(req, res) {
    try {
      let body = _extend({}, req.body);

      if (body.email == undefined || body.email == null || body.email == "")
        return responseError(res, 400, 36, "EMAIL_NOT_FOUND");

      let data_admin = await student_model.findOne({ email: body.email });
      if (!data_admin) return responseError(res, 400, 36, "EMAIL_NOT_FOUND");

      transporter.verify((error, success) => {
        console.log("error", error);

        if (error) return responseError(res, 400, 38, "CONNECT_ACCOUNT_ERROR");

        let key_password = create_key();

        let html = teamplate_send_mail(key_password, body.email);
        transporter.sendMail(html, async (error, body) => {
          if (error) return responseError(res, 400, 40, "SEND_MAIL_ERROR");

          await student_model.findByIdAndUpdate(data_admin._id, {
            $set: {
              "resetPassword.key": key_password,
              "resetPassword.expires": Date.now() + 1800000, //30p
            },
          });
          return responseOk(res, "SEND_MAIL_SUCCESS");
        });
      });
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async ResetForgotPassWord(req, res) {
    try {
      let body = _extend({}, req.body);

      let data_admin = await student_model.findOne({
        "resetPassword.key": body.key,
        "resetPassword.expires": { $gt: Date.now() },
      });
      if (!data_admin)
        return responseError(res, 400, 42, "CODE_NOT_FOUND_OR_EXPIRED");

      await student_model.findOneAndUpdate(
        { "resetPassword.key": body.key },
        {
          password: bcrypt.hashSync(slug(body.password), 10),
          "resetPassword.key": "",
          "resetPassword.expires": "",
        },
        { new: true }
      );

      return responseOk(res, "RESET_PASSWORD_SUCCESS");
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }
}

module.exports = ResetPassWord;
