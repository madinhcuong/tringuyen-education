const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model");
const { responseError } = require("./_base_helpers");
module.exports = {
  adminAuthMiddleware: (req, res, next) => {
    try {
      jwt.verify(req.get("access_token"), "secretkey", (err, adminAuth) => {
        if (err != null) {
          return responseError(res, 400, 999, "access_token");
        } else {
          if (!adminAuth.admin)
            return responseError(res, 400, 999, "access_token");
          Admin.findById(adminAuth.admin._id)
            .populate("permissionGroup")
            .then(admin => {
              if (admin) {
                req.authenticatedAdmin = admin;
                next();
              } else {
                console.log("loi admin b");
                return responseError(res, 400, 0, "loi admin b");
              }
            })
            .catch(() => {
              console.log("loi admin c");
              return responseError(res, 400, 0, "loi admin c");
            });
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
};
