const { _extend } = require("util");
const bcrypt = require("bcrypt");
const {
  responseOk,
  responseError,
  savelogs,
  ImportImages,
  slug,
} = require("../../helpers/_base_helpers");
const moment = require("moment");
const { check_time } = require("../../helpers/check_time.helpers");

const Teacher_model = require("../../models/admin.model");
const class_model = require("../../models/class.model");

class Training {
  async GetInforTeacher(req, res) {
    try {
      let seach_name = req.query.seach_name;
      let seach_email = req.query.seach_email;
      let seach_status = req.query.seach_status;
      if (seach_name == null || seach_name == undefined) seach_name = "";
      if (seach_email == null || seach_email == undefined) seach_email = "";

      let query = {
        $match: {
          $and: [
            { type: "TEACHER" },
            { fullName: { $regex: seach_name, $options: "$i" } },
            { email: { $regex: seach_email, $options: "$i" } },
          ],
        },
      };

      if (
        seach_status != null &&
        seach_status != undefined &&
        seach_status != ""
      ) {
        query = {
          $match: {
            $and: [
              { type: "TEACHER" },
              { fullName: { $regex: seach_name, $options: "$i" } },
              { email: { $regex: seach_email, $options: "$i" } },
              { status: seach_status },
            ],
          },
        };
      }

      let data = await Teacher_model.aggregate([
        query,
        {
          $lookup: {
            from: "adminroles",
            localField: "permissionGroup",
            foreignField: "_id",
            as: "role",
          },
        },
        {
          $unwind: "$role",
        },
        {
          $lookup: {
            from: "trainings",
            localField: "specialize",
            foreignField: "_id",
            as: "specialize",
          },
        },
        {
          $unwind: "$specialize",
        },
        {
          $project: {
            avatar: 1,
            fullName: 1,
            date: 1,
            phone: 1,
            address: 1,
            specialize: "$specialize.name",
            email: 1,
            type: 1,
            status: 1,
            sex: 1,
            role: "$role.name",
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ]);

      return responseOk(res, data);
    } catch (err) {
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async GetTeacherById(req, res) {
    try {
      let id_teacher = req.params.id;
      let data = await Teacher_model.findById(id_teacher)
        .populate({
          path: "permissionGroup specialize",
          select: "name",
        })
        .select(
          "avatar fullName date phone sex depict address specialize permissionGroup type status email"
        );
      if (!data) return responseError(res, 400, 14, "TEACHER_NOT_FOUND");

      return responseOk(res, data);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async GetTeacherByIdClass(req, res) {
    try {
      let id_Class = req.params.id;

      let data_training = await class_model
        .findOne({ _id: id_Class })
        .populate([
          {
            path: "id_Courses",
            populate: {
              path: "id_training",
              select: "name",
            },
            select: "name",
          },
        ])
        .select("id_Courses");
      if (!data_training)
        return responseError(res, 400, 52, "TRAINING_NOT_FOUND");

      let data_teacher = [];
      if (
        data_training.id_Courses &&
        data_training.id_Courses.id_training &&
        data_training.id_Courses.id_training._id
      ) {
        data_teacher = await Teacher_model.find({
          specialize: data_training.id_Courses.id_training._id,
          type: "TEACHER",
          status: "ACTIVATE",
        }).select("fullName");
        if (!data_teacher)
          return responseError(res, 400, 14, "TRAINING_NOT_FOUND");
      }

      return responseOk(res, data_teacher);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  // async GetTeacherByIdClass(req, res) {
  //   try {
  //     let body = _extend({}, req.body);
  //     let id_Class = req.params.id;

  //     let data_class = await class_model
  //       .findOne({ _id: id_Class })
  //       .populate([
  //         {
  //           path: "id_Courses",
  //           populate: {
  //             path: "id_training",
  //             select: "name"
  //           },
  //           select: "name"
  //         }
  //       ])
  //       .select("name time_day time_start time_end");
  //     if (!data_class) return responseError(res, 400, 30, "CLASSALL_NOT_FOUND");

  //     // console.log("data_class", data_class);

  //     let id_training = data_class.id_Courses.id_training._id;
  //     let array_time_day_class = data_class.time_day;

  //     let arr_class = await class_model
  //       .find({ status: "STUDYING" })
  //       .populate([
  //         {
  //           path: "id_teacher",
  //           select: "fullName specialize"
  //         }
  //       ])
  //       .select("time_start time_end time_day");
  //     if (arr_class.length > 0) {
  //       let arr_teacher = [];
  //       for (let item of arr_class) {
  //         if (
  //           JSON.stringify(id_training) ==
  //           JSON.stringify(item.id_teacher.specialize)
  //         ) {
  //           arr_teacher.push(item);
  //         }
  //       }
  //       //  console.log("array_time_day_class", array_time_day_class);
  //       // console.log("arr_teacher", arr_teacher);

  //       let time_start_class = data_class.time_start;
  //       let time_end_class = data_class.time_end;
  //       let array_time_day_class = data_class.time_day;

  //       for (let item of arr_teacher) {
  //         for (let index of item.time_day) {
  //           let time_start_teacher = item.time_start;
  //           let time_end_teacher = item.time_end;
  //           let th_teacher = index.th;
  //           let hour_start_teacher = index.hour_start;
  //           let hour_end_teacher = index.hour_end;

  //           for (let item_class of array_time_day_class) {
  //             let th_class = item_class.th;
  //             let hour_start_class = item_class.hour_start;
  //             let hour_end_class = item_class.hour_end;
  //             if (
  //               check_time(
  //                 time_start_teacher,
  //                 time_end_teacher,
  //                 th_teacher,
  //                 hour_start_teacher,
  //                 hour_end_teacher,
  //                 time_start_class,
  //                 time_end_class,
  //                 th_class,
  //                 hour_start_class,
  //                 hour_end_class
  //               )
  //             ) {
  //               console.log("push đi");
  //             } else {
  //               console.log("ko duoc");
  //             }
  //           }

  //           // console.log("time_start", time_start_teacher);
  //           // console.log("_teacher", time_end_teacher);
  //           // console.log("th_teacher", th_teacher);
  //           // console.log("hour_start_teacher", hour_start_teacher);
  //           // console.log("hour_end_teacher", hour_end_teacher);
  //           // console.log("item", item);
  //         }
  //       }
  //     }

  //     return responseOk(res, "data");
  //   } catch (err) {
  //     console.log(err);
  //     return responseError(res, 500, 0, "ERROR");
  //   }
  // }

  async CreateTeacher(req, res) {
    try {
      let body = _extend({}, req.body);
      // let path_name = await ImportImages(req, res);

      let data = {
        // avatar: path_name ? path_name : "",
        avatar: body.avatar,
        fullName: body.fullName,
        email: body.email,
        password: bcrypt.hashSync(slug(body.date), 10),
        permissionGroup: body.permissionGroup,
        specialize: body.specialize,
        address: body.address,
        date: body.date,
        sex: body.sex,
        phone: body.phone,
        depict: body.depict,
        type: "TEACHER",
      };

      let data_admin = await new Teacher_model(data).save();
      if (!data_admin) return responseError(res, 400, 12, "NOT_CREATE_STAFF");

      savelogs(req.authenticatedAdmin._id, "CREATE", "Thêm mới giáo viên");

      return responseOk(res, data_admin);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async UpdateStatus(req, res) {
    try {
      let body = _extend({}, req.body);
      let id_teacher = req.params.id;
      let data_teacher = await Teacher_model.findByIdAndUpdate(
        id_teacher,
        {
          status: body.status,
        },
        { new: true }
      );
      if (!data_teacher)
        return responseError(res, 400, 14, "TEACHER_NOT_FOUND");

      savelogs(
        req.authenticatedAdmin._id,
        "UPDATE",
        "Chỉnh sửa trạng thái giáo viên"
      );

      // Logout tk khi thay doi trang thai tk
      io.sockets.in(id_teacher).emit("LOGOUT_ACCOUNT", "Logout account");

      return responseOk(res, data_teacher);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async UpdateTeacher(req, res) {
    try {
      let id_teacher = req.params.id;
      let body = _extend({}, req.body);

      let Check_email_By_id = await Teacher_model.findById(id_teacher).select(
        "email"
      );
      if (!Check_email_By_id)
        return responseError(res, 400, 14, "TEACHER_NOT_FOUND");

      let Check_email = await Teacher_model.findOne({
        email: body.email,
      }).select("email");

      if (Check_email && Check_email_By_id.email != Check_email.email)
        return responseError(res, 400, 18, "EMAIL_DUPLICATE");

      let data_body = {
        avatar: body.avatar,
        fullName: body.fullName,
        date: body.date,
        phone: body.phone,
        sex: body.sex,
        depict: body.depict,
        address: body.address,
        specialize: body.specialize,
        permissionGroup: body.permissionGroup,
        email: body.email,
      };

      let data = await Teacher_model.findByIdAndUpdate(id_teacher, data_body, {
        new: true,
      });
      if (!data) return responseError(res, 400, 14, "TEACHER_NOT_FOUND");

      savelogs(req.authenticatedAdmin._id, "UPDATE", "Chỉnh sửa giáo viên");

      return responseOk(res, data);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }
}
module.exports = Training;
