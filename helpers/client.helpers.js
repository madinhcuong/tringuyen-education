const jwt = require("jsonwebtoken");
const student = require("../models/student.model");
const moment = require("moment");
const { responseError } = require("./_base_helpers");
module.exports = {
  clientAuthMiddleware: (req, res, next) => {
    try {
      jwt.verify(req.get("access_token"), "secretkey", (err, clientAuth) => {
        if (err != null) {
          return responseError(res, 400, 999, "access_token");
        } else {
          if (!clientAuth.student)
            return responseError(res, 400, 999, "access_token");
          student
            .findById(clientAuth.student._id)
            .populate([
              {
                path: "id_debit",
                select: {
                  wallet: 1,
                  money: 1,
                  check_money: 1,
                  discount: 1,
                  createdAt: 1,
                  updatedAt: 1,
                  level:1,
                  _id: 1,
                },
              },
            ])
            .then((student) => {
              if (student) {
                req.authenticatedClient = student;
                next();
              } else {
                console.log("loi Client b");
                return responseError(res, 400, 0, "loi Client b");
              }
            })
            .catch(() => {
              console.log("loi Client c");
              return responseError(res, 400, 0, "loi Client c");
            });
        }
      });
    } catch (error) {
      console.log(error);
    }
  },
};
