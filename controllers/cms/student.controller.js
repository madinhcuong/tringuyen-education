const { _extend } = require("util");
const bcrypt = require("bcrypt");
const {
  responseOk,
  responseError,
  savelogs,
  create_key,
  slug,
  createDiplomaCode,
} = require("../../helpers/_base_helpers");
const { check_time_discount } = require("../../helpers/check_time.helpers");

const student_model = require("../../models/student.model");
const debit_model = require("../../models/debit.model");
const registeredLearn_model = require("../../models/registeredLearn.model");
const courses_model = require("../../models/courses.model");
const class_model = require("../../models/class.model");

class Student {
  async GetListStudent(req, res) {
    try {
      let seach_name = req.query.name;
      let seach_email = req.query.email;
      if (seach_name == null || seach_name == undefined) seach_name = "";
      if (seach_email == null || seach_email == undefined) seach_email = "";

      let data_student = await student_model.aggregate([
        {
          $match: {
            $and: [
              { check_learn: true },
              { type: "STUDENT" },
              { name: { $regex: seach_name, $options: "$i" } },
              { email: { $regex: seach_email, $options: "$i" } },
            ],
          },
        },
        {
          $lookup: {
            from: "debits",
            localField: "id_debit",
            foreignField: "_id",
            as: "id_debit",
          },
        },
        {
          $unwind: "$id_debit",
        },
        {
          $project: {
            wallet: "$id_debit.wallet",
            name: 1,
            image: 1,
            date: 1,
            phone: 1,
            sex: 1,
            address: 1,
            email: 1,
            check_learn: true,
            type: 1,
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ]);

      return responseOk(res, data_student);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async GetStudentById(req, res) {
    try {
      let id_studen = req.params.id;

      let data_student = await student_model
        .findById(id_studen)
        .populate([{ path: "id_debit", select: "wallet" }])
        .select(
          "id_debit agent_code your_agent name image date phone sex address email"
        );
      if (!data_student)
        return responseError(res, 400, 44, "STUDENT_NOT_FOUND");

      return responseOk(res, data_student);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async GetClassStuentById(req, res) {
    try {
      let id_student = req.params.id;

      let class_student = await registeredLearn_model
        .find({
          id_student: id_student,
        })
        .populate([
          {
            path: "id_Class",
            select: "name time_day time_start time_end status",
          },
        ])
        .select("id_Class payment_status");

      if (class_student.length < 1)
        return responseError(res, 400, 44, "STUDENT_NOT_FOUND");

      return responseOk(res, class_student);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async CreateStudent(req, res) {
    try {
      let body = _extend({}, req.body);

      let data_student = await student_model
        .findOne({ email: body.email })
        .populate([{ path: "id_debit", select: "discount" }])
        .select("name id_debit");

      // chưa có tk check email trùng
      if (data_student && body.check_account_val == "NOACCOUNT")
        return responseError(res, 400, 18, "EMAIL_DUPLICATE");

      // đã có tk email check ko tìm thấy
      if (!data_student && body.check_account_val == "ACCOUNT")
        return responseError(res, 400, 64, "EMAIL_NOT_FOUND_REGISTER");

      let data_class = await class_model
        .findById(body.id_Class)
        .populate([
          {
            path: "id_Courses",
            select: "tuition_Fees name",
          },
        ])
        .select("id_Courses name");
      if (!data_class) return responseError(res, 400, 30, "CLASSALL_NOT_FOUND");

      // check đã đăng ký lớp học chưa
      if (data_student && data_class) {
        let check_class_registeredLearn = await registeredLearn_model.findOne({
          id_student: data_student._id,
          id_Class: data_class._id,
        });
        if (check_class_registeredLearn)
          return responseError(res, 400, 46, "CLASS_DUPLICATE");
      }

      // TH chưa có TK
      if (body.check_account_val == "NOACCOUNT") {
        let data_debit = await new debit_model().save();

        let data_body = {
          password: bcrypt.hashSync(slug(body.date), 10),
          email: body.email,
          address: body.address,
          sex: body.sex,
          phone: body.phone,
          date: body.date,
          name: body.name,
          agent_code: body.agent_code,
          your_agent: create_key(),
          id_debit: data_debit._id,
          type: "STUDENT",
          list_child_agent: [],
          image: body.image,
        };

        let create_student = await new student_model(data_body).save();

        let data_register = await new registeredLearn_model({
          id_Class: data_class._id,
          id_student: create_student._id,
          tuition_Fees: data_class.id_Courses.tuition_Fees,
          tuition_Fees_discount: data_class.id_Courses.tuition_Fees,
          new_regis: "NOACCOUNT",
          diploma_code: createDiplomaCode(),
        }).save();

        if (body.agent_code && body.agent_code != "") {
          let data_agent_code = await student_model.findOneAndUpdate(
            { your_agent: body.agent_code },
            {
              $push: {
                list_child_agent: { id: create_student._id.toString() },
              },
            }
          );
        }

        return responseOk(res, "CREATE_STUDENT_SUCCESS");
      }

      // TH có TK
      if (body.check_account_val == "ACCOUNT") {
        let obj_discount = data_student.id_debit.discount.find(
          (key) => key.discount_code === body.discount_code
        );

        let tuition_Fees_discount = data_class.id_Courses
          ? data_class.id_Courses.tuition_Fees
          : 0;

        // check time discount_code và tính sale
        if (obj_discount && check_time_discount(obj_discount.expiry_date)) {
          tuition_Fees_discount =
            data_class.id_Courses.tuition_Fees *
            ((100 - obj_discount.sale) / 100);
        }

        let data = {
          id_Class: data_class._id,
          id_student: data_student._id,
          sale_percent: obj_discount ? obj_discount.sale : 0,
          tuition_Fees: data_class.id_Courses.tuition_Fees,
          tuition_Fees_discount: tuition_Fees_discount,
          new_regis: "ACCOUNT",
          diploma_code: createDiplomaCode(),
        };

        let save_register = await new registeredLearn_model(data).save();

        if (obj_discount) {
          await debit_model.update(
            { _id: data_student.id_debit._id },
            {
              $pull: {
                discount: { discount_code: obj_discount.discount_code },
              },
            }
          );
        }

        return responseOk(res, "CREATE_STUDENT_SUCCESS");
      }
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async UpdateStudent(req, res) {
    try {
      let body = _extend({}, req.body);
      let id_student = req.params.id;

      let data_student = await student_model
        .findById(id_student)
        .select("email");
      if (!data_student)
        return responseError(res, 400, 44, "STUDENT_NOT_FOUND");

      let Check_email = await student_model
        .findOne({
          email: body.email,
        })
        .select("email");

      if (Check_email && data_student.email != Check_email.email)
        return responseError(res, 400, 18, "EMAIL_DUPLICATE");

      let update_student = await student_model.findByIdAndUpdate(
        data_student._id,
        body
      );
      if (!update_student)
        return responseError(res, 400, 44, "STUDENT_NOT_FOUND");

      savelogs(req.authenticatedAdmin._id, "UPDATE", "Sửa đổi thông tin học viên");

      return responseOk(res, "UPDATE_SUCCESS");
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }
}

module.exports = Student;
