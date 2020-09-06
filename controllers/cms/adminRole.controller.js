const bcrypt = require("bcrypt");
const { _extend } = require("util");
const {
  responseOk,
  responseError,
  savelogs,
} = require("../../helpers/_base_helpers");
const { permissionsDefault } = require("../../config/base.config");
const AdminRole_model = require("../../models/adminrole.model");

class AdminRole {
  async getListAddPermission(req, res) {
    try {
      return responseOk(res, permissionsDefault);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async getListPermission(req, res) {
    try {
      let { seach_name } = req.query;
      if (seach_name == null || seach_name == undefined) seach_name = "";

      let data = await AdminRole_model.aggregate([
        { $match: { name: { $regex: seach_name, $options: "$i" } } },
        { $sort: { createdAt: -1 } },
      ]);

      return responseOk(res, data);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async GetListRoleByTeacher_Staff(req, res) {
    try {
      let data = await AdminRole_model.aggregate([
        { $project: { name: 1 } },
        { $sort: { createdAt: -1 } },
      ]);

      return responseOk(res, data);
    } catch (err) {
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async getPermissionById(req, res) {
    try {
      let id_permission = req.params.id;

      let data = await AdminRole_model.findById(id_permission);
      if (!data) return responseError(res, 400, 10, "ADMIN_ROLE_NOT_FOUND");

      return responseOk(res, data);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async CreatePermission(req, res) {
    try {
      let body = _extend({}, req.body);

      let data = await new AdminRole_model({
        description: body.description,
        name: body.name,
        permissions: body.permissions,
      }).save();

      savelogs(req.authenticatedAdmin._id, "CREATE", "Thêm mới bộ quyền");

      return responseOk(res, " CREATE_SUCCESS");
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async UpdatePermission(req, res) {
    try {
      let id_role = req.params.id;
      let body = _extend({}, req.body);

      let data = await AdminRole_model.findByIdAndUpdate(id_role, {
        description: body.description,
        name: body.name,
        permissions: body.permissions,
      });
      if (!data) return responseError(res, 400, 10, "ADMIN_ROLE_NOT_FOUND");

      savelogs(req.authenticatedAdmin._id, "UPDATE", "Sửa đổi bộ quyền");

      // send noti khi update
      io.sockets.in(id_role).emit("RESET_CMS_PERMISSION", "Load_Page");

      return responseOk(res, data);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async DeletePermission(req, res) {
    try {
      let id_role = req.params.id;
      let data = await AdminRole_model.findByIdAndDelete(id_role);
      if (!data) return responseError(res, 400, 10, "ADMIN_ROLE_NOT_FOUND");

      savelogs(req.authenticatedAdmin._id, "DELETE", "Xóa quyền");
      return responseOk(res, "DELETE_SUCCESS");
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }
}

module.exports = AdminRole;
