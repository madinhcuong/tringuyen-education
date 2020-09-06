const { _extend } = require("util");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const uuidv4 = require("uuid/v4");
const QRCode = require("qrcode");
const ExcelJS = require("exceljs");
const {
  responseOk,
  responseError,
  savelogs,
  getPathFile,
  getValueOfCell,
  isNumber,
} = require("../../helpers/_base_helpers");
const { createNotification } = require("../../helpers/notification.helpers");
const { distribution_student } = require("../../helpers/class.helpers");
const { subtract_Date } = require("../../helpers/date.helpers");
const { check_time } = require("../../helpers/check_time.helpers");

const Class_model = require("../../models/class.model");
const Register_model = require("../../models/registeredLearn.model");
const Student_model = require("../../models/student.model");
const fileUpload_model = require("../../models/fileUpload.model");
const { static } = require("express");

class Class {
  async GetListClass(req, res) {
    try {
      let seach_name_courses = req.query.name_courses;
      let seach_name_class = req.query.name_class;
      let seach_status_class = req.query.status_class;

      if (
        !seach_name_courses ||
        seach_name_courses == null ||
        seach_name_courses == undefined ||
        seach_name_courses == ""
      )
        seach_name_courses = "";
      if (
        !seach_name_class ||
        seach_name_class == null ||
        seach_name_class == undefined ||
        seach_name_class == ""
      )
        seach_name_class = "";

      let query = {
        $match: { name: { $regex: seach_name_class, $options: "$i" } },
      };

      if (req.authenticatedAdmin.type == "TEACHER") {
        query = {
          $match: {
            name: { $regex: seach_name_class, $options: "$i" },
            id_teacher: req.authenticatedAdmin._id,
          },
        };
      }

      if (seach_status_class) {
        query = {
          $match: {
            name: { $regex: seach_name_class, $options: "$i" },
            status: seach_status_class,
          },
        };
      }

      if (req.authenticatedAdmin.type == "TEACHER" && seach_status_class) {
        query = {
          $match: {
            name: { $regex: seach_name_class, $options: "$i" },
            status: seach_status_class,
            id_teacher: req.authenticatedAdmin._id,
          },
        };
      }

      let List_class = await Class_model.aggregate([
        query,
        {
          $lookup: {
            from: "courses",
            let: { id_Courses: "$id_Courses" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$id_Courses"] },
                  name: {
                    $regex: seach_name_courses,
                    $options: "$i",
                  },
                },
              },
              { $project: { name: 1 } },
            ],
            as: "id_Courses",
          },
        },
        {
          $project: {
            id_Courses: 1,
            schedule: 1,
            name: 1,
            time_day: 1,
            time_month: 1,
            time_start: 1,
            time_end: 1,
            total_lesson: 1,
            status: 1,
            depict: 1,
            createdAt: 1,
          },
        },
        {
          $unwind: "$id_Courses",
        },
        {
          $unwind: { path: "$id_Courses", preserveNullAndEmptyArrays: true },
        },
        { $sort: { createdAt: -1 } },
      ]);

      return responseOk(res, List_class);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async GetByIdClassAll(req, res) {
    try {
      let id_class = req.params.id;

      let query = {
        _id: id_class,
      };

      if (req.authenticatedAdmin.type == "TEACHER") {
        query = {
          _id: id_class,
          id_teacher: req.authenticatedAdmin._id,
        };
      }

      let data_Class = await Class_model.findOne(query)
        .populate({
          path: "id_Courses id_teacher",
          select: { name: 1, fullName: 1 },
        })
        .select(
          "id_Courses name time_day time_month time_start time_end total_lesson status id_teacher"
        );
      if (!data_Class) return responseError(res, 400, 30, "CLASSALL_NOT_FOUND");

      return responseOk(res, data_Class);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async GetClassByIdTeacher(req, res) {
    try {
      let id_teacher = req.params.id;

      // get list lop học theo giáo viên đang dạy (STUDYING)
      let data_class = await Class_model.find({
        id_teacher: id_teacher,
        status: "STUDYING",
      })
        .populate([{ path: "id_Courses", select: "name" }])
        .select("id_Courses name time_day time_start time_end");

      if (data_class.length < 1) data_class = [];

      return responseOk(res, data_class);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async ListClassNoPermission(req, res) {
    try {
      let data_class = await Class_model.find({ status: "OPEN" }).select(
        "name"
      );
      if (!data_class) data_class = [];

      return responseOk(res, data_class);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async CreateClass(req, res) {
    try {
      let body = _extend({}, req.body);

      let days = subtract_Date(body.time_start, body.time_end);
      let month = Math.round((days / 30) * 10) / 10;

      let data = {
        id_Courses: body.id_Courses,
        name: body.name,
        time_day: body.time_day,
        time_month: month,
        time_start: body.time_start,
        time_end: body.time_end,
        //  status: body.status
        status: "OPEN",
      };

      let data_Class = await new Class_model(data).save();
      if (!data_Class) return responseError(res, 400, 28, "NOT_CREATE_CLASS");

      savelogs(req.authenticatedAdmin._id, "CREATE", "Thêm mới lớp học");

      return responseOk(res, "data_Class");
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async UpdateStatusClassAll(req, res) {
    try {
      let id_class = req.params.id;
      let body = _extend({}, req.body);

      let data_Class = await Class_model.findByIdAndUpdate(
        id_class,
        { status: body.status },
        { new: true }
      );
      if (!data_Class) return responseError(res, 400, 30, "CLASSALL_NOT_FOUND");

      savelogs(req.authenticatedAdmin._id, "UPDATE", "sửa trạng thái lớp học");

      return responseOk(res, data_Class);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async UpdateClassAll(req, res) {
    try {
      let id_class = req.params.id;
      let body = _extend({}, req.body);

      let data_Class = await Class_model.findByIdAndUpdate(id_class, body, {
        new: true,
      });
      if (!data_Class) return responseError(res, 400, 30, "CLASSALL_NOT_FOUND");

      savelogs(
        req.authenticatedAdmin._id,
        "UPDATE",
        "Sửa đổi thông tin lớp học"
      );

      return responseOk(res, "UPDATE_SUCCESS");
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async UpdateTeacherClass(req, res) {
    try {
      let id_class = req.params.id;
      let body = _extend({}, req.body);

      // check giao vien đang giảng dạy lớp này
      let check_teacher = await Class_model.findOne({
        _id: id_class,
        id_teacher: body.id_teacher,
        status: "STUDYING",
      }).select("id_teacher");
      if (check_teacher)
        return responseError(res, 400, 56, "TEACHER_DUPLICATE");

      let data_class = await Class_model.findById(id_class).select(
        "time_day time_start time_end"
      );
      if (!data_class) return responseError(res, 400, 30, "CLASSALL_NOT_FOUND");

      let data_teacher = await Class_model.find({
        id_teacher: body.id_teacher,
        status: "STUDYING",
      }).select("time_day time_start time_end");

      if (data_teacher.length < 1) {
        let update_class = await Class_model.findByIdAndUpdate(id_class, {
          id_teacher: body.id_teacher,
          status: "STUDYING",
        });

        savelogs(
          req.authenticatedAdmin._id,
          "UPDATE",
          "Sắp xếp lịch giảng dạy"
        );

        return responseOk(res, "UPDATE_SUCCESS");
      }

      let time_start_class = data_class.time_start;
      let time_end_class = data_class.time_end;

      for (let item of data_class.time_day) {
        let th_class = item.th;
        let hour_start_class = item.hour_start;
        let hour_end_class = item.hour_end;

        for (let obj_teacher of data_teacher) {
          let time_start_teacher = obj_teacher.time_start;
          let time_end_teacher = obj_teacher.time_end;
          for (let arr_timeday_teacher of obj_teacher.time_day) {
            let th_teacher = arr_timeday_teacher.th;
            let hour_start_teacher = arr_timeday_teacher.hour_start;
            let hour_end_teacher = arr_timeday_teacher.hour_end;

            if (
              !check_time(
                time_start_teacher,
                time_end_teacher,
                th_teacher,
                hour_start_teacher,
                hour_end_teacher,
                time_start_class,
                time_end_class,
                th_class,
                hour_start_class,
                hour_end_class
              )
            ) {
              return responseError(res, 400, 54, "SCHEDULE_TEACHER_DUPLICATE");
            }
          }
        }
      }

      let update_id_teacher_class = await Class_model.findByIdAndUpdate(
        id_class,
        {
          id_teacher: body.id_teacher,
          status: "STUDYING",
        }
      );

      savelogs(req.authenticatedAdmin._id, "UPDATE", "Sắp xếp lịch giảng dạy");

      return responseOk(res, "UPDATE_SUCCESS");
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async GetListStudentByIdClass(req, res) {
    try {
      let id_class = req.params.id;
      let seach_name_student = req.query.nameStudent;

      if (
        !seach_name_student ||
        seach_name_student == null ||
        seach_name_student == undefined ||
        seach_name_student == ""
      )
        seach_name_student = "";

      let data_student = await Register_model.aggregate([
        {
          $match: {
            $and: [
              { id_Class: ObjectId(id_class) },
              { payment_status: "APPROVED" },
            ],
          },
        },
        {
          $lookup: {
            from: "students",
            let: { id_student: "$id_student" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$id_student"] },
                  name: {
                    $regex: seach_name_student,
                    $options: "$i",
                  },
                },
              },
              {
                $project: {
                  name: 1,
                  date: 1,
                  sex: 1,
                  email: 1,
                  phone: 1,
                  score_30: 1,
                  score_70: 1,
                  total_score: 1,
                },
              },
            ],
            as: "id_student",
          },
        },
        {
          $lookup: {
            from: "classes",
            let: { id_Class: "$id_Class" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$id_Class"] },
                },
              },
              {
                $project: { name: 1, status: 1 },
              },
            ],
            as: "id_Class",
          },
        },
        {
          $project: {
            id_Class: 1,
            id_student: 1,
            score_30: 1,
            score_70: 1,
            total_score: 1,
          },
        },
        {
          $unwind: "$id_Class",
        },
        {
          $unwind: { path: "$id_Class", preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: "$id_student",
        },
        {
          $unwind: { path: "$id_student", preserveNullAndEmptyArrays: true },
        },
        {
          $group: {
            _id: "$id_Class.name",
            status: { $addToSet: "$id_Class.status" },
            count: {
              $sum: 1,
            },
            data: {
              $push: {
                _id: "$id_student._id",
                name: "$id_student.name",
                date: "$id_student.date",
                sex: "$id_student.sex",
                score_30: "$score_30",
                score_70: "$score_70",
                total_score: "$total_score",
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            count: 1,
            status: { $arrayElemAt: ["$status", 0] },
            data: 1,
          },
        },
      ]);

      return responseOk(res, data_student);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  // import điểm học viên
  async ImportScoreStudent(req, res) {
    try {
      let id_class = req.params.id_class;
      let files = req.files;
      if (!files) {
        return responseError(res, 400, 58, "FILE_NOT_FOUND");
      }
      let pathFile = await getPathFile(req, res);

      let save_pathFile = await new fileUpload_model({
        path_name: pathFile,
      }).save();

      let wb = new ExcelJS.Workbook();
      let Workbook = await wb.xlsx.readFile(pathFile);
      let worksheet = Workbook.getWorksheet(1);
      let data_Error = [];
      let scoreDatas = [];
      await worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 9) {
          let scoreData = {
            rowNumber: rowNumber,
            id_register: row.getCell(2).value
              ? getValueOfCell(row.getCell(2).value)
              : "",
            score_30: row.getCell(4).value,
            score_70: row.getCell(5).value,
          };

          scoreDatas.push(scoreData);
        }
      });

      for (let item of scoreDatas) {
        let data_score_30 = item.score_30;
        let data_score_70 = item.score_70;

        let err_row = "";
        // điểm 30
        if (
          !isNumber(data_score_30) ||
          (isNumber(data_score_30) && parseInt(data_score_30) > 10) ||
          (isNumber(data_score_30) && parseInt(data_score_30) < 0)
        ) {
          err_row = {
            rowNumber: item.rowNumber,
            data: `Dòng ${item.rowNumber}: Điểm QT không đúng định dạng.`,
          };
          data_Error.push(err_row);
        }

        // điểm 70
        if (
          !isNumber(data_score_70) ||
          (isNumber(data_score_70) && parseInt(data_score_70) > 10) ||
          (isNumber(data_score_70) && parseInt(data_score_70) < 0)
        ) {
          err_row = {
            rowNumber: item.rowNumber,
            data: `Dòng ${item.rowNumber}: Điểm thi không đúng định dạng.`,
          };
          data_Error.push(err_row);
        }

        if (!err_row) {
          let total_scores = (data_score_30 * 30 + data_score_70 * 70) / 100;

          let update_score = await Register_model.findOneAndUpdate(
            { _id: item.id_register, id_Class: id_class },
            {
              score_30: data_score_30,
              score_70: data_score_70,
              total_score: total_scores,
            },
            { new: true }
          );

          if (!update_score) {
            let err_row = {
              rowNumber: item.rowNumber,
              data: `Dòng ${item.rowNumber}: Không tìm thấy học viên.`,
            };
            data_Error.push(err_row);
            continue;
          }
        }
      }

      savelogs(req.authenticatedAdmin._id, "UPDATE", "Import điểm học viên");

      if (data_Error.length > 0) {
        return responseError(res, 400, 108, data_Error);
      }

      return responseOk(res, "UPLOAD_SUCCESS");
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async ExportExcelScoreStudent(req, res) {
    try {
      let id_class = req.params.id;

      let data_student_class = await Register_model.find({
        id_Class: id_class,
        payment_status: "APPROVED",
      })
        .populate([
          {
            path: "id_student",
            match: { check_learn: true, type: "STUDENT" },
            select: "name",
          },
        ])
        .populate([
          {
            path: " id_Class",
            select: "name time_start time_end status",
          },
        ])
        .select("id_Class id_student score_30 score_70 total_score");

      if (data_student_class.length < 1)
        return responseError(res, 400, 62, "DATA_STUDENT_NOT_FOUND");

      let data_student = [];
      data_student_class.map((item, key) => {
        let data = [
          key + 1,
          item._id.toString(),
          item.id_student.name,
          item.score_30,
          item.score_70,
          item.total_score,
          distribution_student(item.total_score),
        ];
        data_student.push(data);
      });

      let workbook = new ExcelJS.Workbook(); //creating workbook
      let worksheet = workbook.addWorksheet("DanhSachHocVien"); //creating worksheet

      let Logo = "TRUNG TÂM ĐÀO TẠO TIN HỌC TRÍ NGUYỄN";
      let Title = "BẢNG ĐIỂM";
      let name_class = `TÊN LỚP HỌC: ${data_student_class[0].id_Class.name.toUpperCase()}`;
      let time_class = `THỜI GIAN: ${data_student_class[0].id_Class.time_start} - ${data_student_class[0].id_Class.time_end}`;
      let total_student = `TỔNG SỐ: ${data_student_class.length} học viên`;

      worksheet.getCell(`A1`).value = Logo;
      worksheet.mergeCells("A1:E1");
      worksheet.getCell(`A1`).font = {
        size: 12,
        bold: true,
        name: "Times New Roman",
      };

      worksheet.getCell(`A3`).value = Title;
      worksheet.mergeCells("A3:G3");
      worksheet.getCell(`A3`).alignment = { horizontal: "center" };
      worksheet.getCell(`A3`).font = {
        size: 15,
        bold: true,
        name: "Times New Roman",
      };

      worksheet.getCell(`A5`).value = name_class;
      worksheet.mergeCells("A5:E5");
      worksheet.getCell(`A5`).font = {
        size: 12,
        bold: true,
        name: "Times New Roman",
      };

      worksheet.getCell(`A6`).value = time_class;
      worksheet.mergeCells("A6:E6");
      worksheet.getCell(`A6`).font = {
        size: 12,
        bold: true,
        name: "Times New Roman",
      };

      worksheet.getCell(`A7`).value = total_student;
      worksheet.mergeCells("A7:E7");
      worksheet.getCell(`A7`).font = {
        size: 12,
        bold: true,
        name: "Times New Roman",
      };
      worksheet.getCell(`A8`).value = "";

      const header = [
        "STT",
        "MSV",
        "HỌ VÀ TÊN",
        "ĐIỂM QT",
        "ĐIỂM THI",
        "ĐIỂM TỔNG KẾT",
        "XẾP LOẠI",
      ];

      worksheet.columns = [
        { width: 7 },
        { width: 30 },
        { width: 25 },
        { width: 15 },
        { width: 15 },
        { width: 25 },
        { width: 25 },
      ];
      worksheet.addRow(header);

      ["A9", "B9", "C9", "D9", "E9", "F9", "G9"].map((key) => {
        worksheet.getCell(key).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "f5f5f5" },
        };
        worksheet.getCell(key).font = {
          size: 12,
          bold: true,
          name: "Times New Roman",
        };
        worksheet.getCell(key).border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        worksheet.getCell(key).alignment = { horizontal: "center" };
      });

      data_student.forEach((item, key) => {
        let row = worksheet.addRow(item);
        row.font = {
          size: 12,
          name: "Times New Roman",
        };
        let qty = row.getCell(7);
        row.getCell(1).alignment = { horizontal: "center" };
        row.getCell(7).alignment = { horizontal: "center" };
        let color = "000";
        if (qty.value == "CHƯA ĐẠT") {
          color = "e20808";
        }
        qty.font = {
          size: 12,
          name: "Times New Roman",
          color: { argb: color },
        };
      });

      res.attachment("DanhSachHocVien.xlsx");
      workbook.xlsx
        .write(res)
        .then(() => {
          res.end();
        })
        .catch((err) => {
          return responseError(res, 500, 0, "ERROR");
        });
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async EditScoreStudent(req, res) {
    try {
      let body = _extend({}, req.body);
      let id_student = req.params.id_student;
      let id_class = req.params.id_class;

      let data_score_30 = body.score_30;
      let data_score_70 = body.score_70;
      if (typeof data_score_30 !== "number")
        data_score_30 = parseInt(data_score_30);

      if (typeof data_score_70 !== "number")
        data_score_70 = parseInt(data_score_70);

      let total_scores = (data_score_30 * 30 + data_score_70 * 70) / 100;

      await Register_model.findOneAndUpdate(
        { id_Class: id_class, id_student: id_student },
        {
          score_30: data_score_30,
          score_70: data_score_70,
          total_score: total_scores,
        },
        { new: true }
      );

      savelogs(req.authenticatedAdmin._id, "UPDATE", "Sửa điểm học viên");

      return responseOk(res, "UPDATE_SUCCESS");
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  // send noti
  async SendNotiClass(req, res) {
    try {
      let body = _extend({}, req.body);

      let data_class = await Class_model.findById(body.id_class).select("name");
      if (!data_class) return responseError(res, 400, 30, "CLASSALL_NOT_FOUND");

      // send one student
      if (
        body.type_model == "NOTI_STUDENT" &&
        body.id_student &&
        body.id_student != ""
      ) {
        let idUser = body.id_student;
        let title = `Lớp ${data_class.name} ${body.title}`;
        let description = body.description;
        let data = {
          ...{ user_send: req.authenticatedAdmin },
          id_class: body.id_class,
        };
        let type = "CLIENT";
        let type_noti = "CLASS";
        let result = await createNotification(
          idUser,
          title,
          description,
          data,
          type,
          type_noti
        );
        if (result) {
          io.sockets.in(body.id_student).emit("GET_LIST_NOTI", title);
        }

        savelogs(req.authenticatedAdmin._id, "SEND_NOTI", "Gửi thông báo");

        return responseOk(res, "SEND_NOTI_SUCCESS");
      }

      // Gưi noti theo lop
      if (
        body.type_model == "NOTI_CLASS" &&
        body.id_class &&
        body.id_class != ""
      ) {
        let data_register = await Register_model.find({
          id_Class: body.id_class,
        }).select("id_student");
        if (data_register < 1)
          return responseError(res, 400, 48, "REGISTER_LEARN_NOT_FOUND");

        for (let item of data_register) {
          let idUser = item.id_student;
          let title = `Lớp ${data_class.name} ${body.title}`;
          let description = body.description;
          let data = {
            ...{ user_send: req.authenticatedAdmin },
            id_class: body.id_class,
          };
          let type = "CLIENT";
          let type_noti = "CLASS";
          let result = await createNotification(
            idUser,
            title,
            description,
            data,
            type,
            type_noti
          );
          if (result) {
            io.sockets.in(item.id_student).emit("GET_LIST_NOTI", title);
          }
        }

        savelogs(req.authenticatedAdmin._id, "SEND_NOTI", "Gửi thông báo");

        return responseOk(res, "SEND_NOTI_SUCCESS");
      }

      return responseOk(res, "SEND_NOTI_SUCCESS");
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  // infor student by id_class and id_student
  async InforStudentClass(req, res) {
    try {
      let id_class = req.params.id_class;
      let id_student = req.params.id_student;

      let data_student = await Register_model.findOne({
        id_Class: id_class,
        id_student: id_student,
      })
        .populate([
          {
            path: "id_student",
            select: "name image date phone sex address email",
          },
        ])
        .select("id_student score_30 score_70 total_score");

      return responseOk(res, data_student);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  // ket thuc lop Học
  async CloseClassByid(req, res) {
    try {
      let id_class = req.params.id;

      let update_class = await Class_model.findByIdAndUpdate(id_class, {
        status: "CLOSE",
      });
      if (!update_class)
        return responseError(res, 400, 30, "CLASSALL_NOT_FOUND");

      savelogs(req.authenticatedAdmin._id, "UPDATE", "Kết thúc lớp học");

      return responseOk(res, "UPDATE_SUCCESS");
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async StatisticClassAll(req, res) {
    try {
      let count_class = await Class_model.aggregate([
        {
          $count: "count",
        },
      ]);

      let count_classOpen = await Class_model.aggregate([
        {
          $match: {
            status: "OPEN",
          },
        },
        {
          $count: "count",
        },
      ]);

      let count_classStudy = await Class_model.aggregate([
        {
          $match: {
            status: "STUDYING",
          },
        },
        {
          $count: "count",
        },
      ]);

      count_class = count_class.length > 0 ? count_class[0].count : 0;
      count_classOpen =
        count_classOpen.length > 0 ? count_classOpen[0].count : 0;
      count_classStudy =
        count_classStudy.length > 0 ? count_classStudy[0].count : 0;

      let data = [
        count_class,
        count_classOpen,
        count_classStudy,
        count_class - (count_classOpen + count_classStudy),
      ];

      return responseOk(res, data);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async StatisticClassByID(req, res) {
    try {
      let { id_Class } = req.query;

      let name_class = await Class_model.findById(id_Class).select("name");
      if (!name_class) return responseError(res, 400, 30, "CLASSALL_NOT_FOUND");

      let student_paymentNot = await Register_model.aggregate([
        {
          $match: {
            $and: [
              { id_Class: ObjectId(id_Class) },
              { payment_status: "PENDING" },
            ],
          },
        },
        {
          $count: "studentAll_payment",
        },
      ]);

      let student_payment = await Register_model.aggregate([
        {
          $match: {
            $and: [
              { id_Class: ObjectId(id_Class) },
              { payment_status: "APPROVED" },
            ],
          },
        },
        {
          $count: "student_payment",
        },
      ]);

      student_payment =
        student_payment.length < 1 ? 0 : student_payment[0].student_payment;

      student_paymentNot =
        student_paymentNot.length < 1
          ? 0
          : student_paymentNot[0].student_paymentNot;

      let static_class = [
        student_payment + student_paymentNot,
        student_payment,
        student_paymentNot,
      ];

      let data = { name_class, static_class };

      return responseOk(res, data);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  // Get qr code
  async GetQrCode(req, res) {
    try {
      QRCode.toDataURL("I am a pony!", function (err, url) {
        console.log(url);
      });

      QRCode.toString("I am a pony!", { type: "terminal" }, function (
        err,
        url
      ) {
        console.log(url);
        return responseOk(res, url);
      });
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }
}
module.exports = Class;
