const bcrypt = require("bcrypt");
const { _extend } = require("util");
const jwt = require("jsonwebtoken");
const {
  responseOk,
  responseError,
  slug
} = require("../../helpers/_base_helpers");
const student_model = require("../../models/student.model");

class Login {
  async LoginStudent(req, res) {
    let body = _extend({}, req.body);

    await student_model
      .findOne({ email: body.username, check_learn: true })
      .then(async student => {
        if (
          !student ||
          !bcrypt.compareSync(slug(body.password), student.password)
        ) {
          return responseError(
            res,
            400,
            100,
            "Email and password does not match"
          );
        } else {
          jwt.sign(
            { student },
            "secretkey",
            { expiresIn: "7 days" },
            (err, token) => {
              if (err) {
                return responseError(res, 500, 0, err.message);
              }
              return responseOk(res, { access_token: token });
            }
          );
        }
      })
      .catch(err => {
        console.log(err);
        return responseError(res, 500, 0, err.message);
      });
  }
}

module.exports = Login;
