const { _extend } = require("util");
const bcrypt = require("bcrypt");
const {
  responseOk,
  responseError,
  savelogs,
  slug
} = require("../../helpers/_base_helpers");

const Staff_model = require("../../models/admin.model");
const adminRole_model = require("../../models/adminrole.model");

class Training {
  async GetInforStaff(req, res) {
    try {
      let seach_name = req.query.seach_name;
      let seach_email = req.query.seach_email;
      let seach_status = req.query.seach_status;
      if (seach_name == null || seach_name == undefined) seach_name = "";
      if (seach_email == null || seach_email == undefined) seach_email = "";

      let query = {
        $match: {
          $and: [
            { type: "STAFF" },
            { fullName: { $regex: seach_name, $options: "$i" } },
            { email: { $regex: seach_email, $options: "$i" } }
          ]
        }
      };

      if (
        seach_status != null &&
        seach_status != undefined &&
        seach_status != ""
      ) {
        query = {
          $match: {
            $and: [
              { type: "STAFF" },
              { fullName: { $regex: seach_name, $options: "$i" } },
              { email: { $regex: seach_email, $options: "$i" } },
              { status: seach_status }
            ]
          }
        };
      }

      let data = await Staff_model.aggregate([
        query,
        {
          $lookup: {
            from: "adminroles",
            localField: "permissionGroup",
            foreignField: "_id",
            as: "role"
          }
        },
        {
          $unwind: "$role"
        },
        {
          $project: {
            avatar: 1,
            fullName: 1,
            date: 1,
            phone: 1,
            address: 1,
            specialize: 1,
            email: 1,
            type: 1,
            status: 1,
            sex: 1,
            role: "$role.name",
            createdAt: 1
          }
        },
        { $sort: { createdAt: -1 } }
      ]);

      return responseOk(res, data);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async GetStaffById(req, res) {
    try {
      let id_staff = req.params.id;
      let data = await Staff_model.findById(
        id_staff
      ).populate("permissionGroup", { name: 1 });
      if (!data) return responseError(res, 400, 16, "STAFF_NOT_FOUND");

      return responseOk(res, data);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async CreateStaff(req, res) {
    try {
      let body = _extend({}, req.body);

      let Check_email = await Staff_model.findOne({ email: body.email });
      if (Check_email) return responseError(res, 400, 18, "EMAIL_DUPLICATE");

      let data = {
        avatar: body.avatar,
        fullName: body.fullName,
        email: body.email,
        password: bcrypt.hashSync(slug(body.date), 10),
        permissionGroup: body.permissionGroup,
        address: body.address,
        date: body.date,
        sex: body.sex,
        phone: body.phone,
        type: "STAFF"
      };

      let data_admin = await new Staff_model(data).save();
      if (!data_admin) return responseError(res, 400, 12, "NOT_CREATE_STAFF");

      savelogs(req.authenticatedAdmin._id, "CREATE", "Thêm mới nhân viên");

      return responseOk(res, data_admin);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async UpdateStaff(req, res) {
    try {
      let id_staff = req.params.id;
      let body = _extend({}, req.body);

      let Check_email_By_id = await Staff_model.findById(id_staff).select(
        "email"
      );
      if (!Check_email_By_id)
        return responseError(res, 400, 16, "STAFF_NOT_FOUND");

      let Check_email = await Staff_model.findOne({ email: body.email }).select(
        "email"
      );

      if (Check_email && Check_email_By_id.email != Check_email.email)
        return responseError(res, 400, 18, "EMAIL_DUPLICATE");

      let data_body = {
        avatar: body.avatar,
        fullName: body.fullName,
        date: body.date,
        phone: body.phone,
        sex: body.sex,
        address: body.address,
        email: body.email,
        permissionGroup: body.permissionGroup
      };

      let data = await Staff_model.findByIdAndUpdate(id_staff, data_body, {
        new: true
      });
      if (!data) return responseError(res, 400, 16, "STAFF_NOT_FOUND");

      savelogs(req.authenticatedAdmin._id, "UPDATE", "Sửa đổi thông tin nhân viên");

      return responseOk(res, "data");
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async UpdateStatusStaff(req, res) {
    try {
      let body = _extend({}, req.body);
      let id_staff = req.params.id;

      let data_staff = await Staff_model.findByIdAndUpdate(
        id_staff,
        {
          status: body.status
        },
        { new: true }
      );

      savelogs(
        req.authenticatedAdmin._id,
        "UPDATE",
        "Chỉnh sửa trạng thái nhân viên"
      );

      // Logout tk khi thay doi trang thai tk
      io.sockets.in(id_staff).emit("LOGOUT_ACCOUNT", "Logout account");

      return responseOk(res, data_staff);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }
}
module.exports = Training;
