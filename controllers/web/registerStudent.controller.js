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
const { score_discount } = require("../../helpers/setting.helpers");

const courses_model = require("../../models/courses.model");
const class_model = require("../../models/class.model");
const student_model = require("../../models/student.model");
const registerLearn_model = require("../../models/registeredLearn.model");
const debit_model = require("../../models/debit.model");

class RegisteredLearn {
  async CreateStudent(req, res) {
    try {
      let body = _extend({}, req.body);

      let data_class = await class_model
        .findById(body.id_class)
        .populate([
          {
            path: "id_Courses",
            select: "tuition_Fees name",
          },
        ])
        .select("id_Courses name");
      if (!data_class) return responseError(res, 400, 30, "CLASSALL_NOT_FOUND");

      let data_student = await student_model
        .findOne({
          email: body.email,
          type: "STUDENT",
        })
        .populate([{ path: "id_debit", select: "discount" }])
        .select("id_debit");

      // chưa có tk check email trùng
      if (data_student && body.check_account_val == "NOACCOUNT")
        return responseError(res, 400, 18, "EMAIL_DUPLICATE");

      // đã có tk email check ko tìm thấy
      if (!data_student && body.check_account_val == "ACCOUNT")
        return responseError(res, 400, 64, "EMAIL_NOT_FOUND_REGISTER");

      if (data_class && data_student) {
        let check_class = await registerLearn_model.findOne({
          id_student: data_student._id,
          id_Class: data_class._id,
        });
        if (check_class) return responseError(res, 400, 46, "CLASS_DUPLICATE");
      }

      // đã có tk: ACCOUNT
      // chưa có tk: NOACCOUNT

      // TH chưa có tài khoản
      if (body.check_account_val == "NOACCOUNT") {
        let data_debit = await new debit_model().save();

        let data_body = {
          password: bcrypt.hashSync(slug(body.date), 10),
          email: body.email,
          //  address: body.address,
          // sex: body.sex,
          phone: body.phone,
          date: body.date,
          name: body.name,
          agent_code: body.agent_code,
          your_agent: create_key(),
          id_debit: data_debit._id,
          type: "STUDENT",
          list_child_agent: [],
        };

        let create_student = await new student_model(data_body).save();

        let data_register = await new registerLearn_model({
          id_Class: data_class._id,
          id_student: create_student._id,
          tuition_Fees: data_class.id_Courses.tuition_Fees,
          tuition_Fees_discount: data_class.id_Courses.tuition_Fees,
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

        // Get lại list Student
        io.sockets.in("admin_TN").emit("GET_LIST_STUDENT_REGISTER", "Get_List");

        return responseOk(res, "CREATE_STUDENT_SUCCESS");
      }

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
          diploma_code: createDiplomaCode(),
        };

        let save_register = await new registerLearn_model(data).save();

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

        // Get lại list Student
        io.sockets.in("admin_TN").emit("GET_LIST_STUDENT_REGISTER", "Get_List");

        return responseOk(res, "CREATE_STUDENT_SUCCESS");
      }
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }
}
module.exports = RegisteredLearn;
