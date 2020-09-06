const { _extend } = require("util");
const { responseOk, responseError } = require("../../helpers/_base_helpers");

const courses_model = require("../../models/courses.model");
const class_model = require("../../models/class.model");
const student_model = require("../../models/student.model");

class Course {
  async GetListCourses(req, res) {
    try {
      let data_courses = await class_model.aggregate([
        { $match: { status: "OPEN" } },
        {
          $group: {
            _id: "$id_Courses",
            class: {
              $push: {
                _id: "$_id",
                name: "$name",
                time_start: "$time_start",
                time_end: "$time_end",
                time_day: "$time_day"
              }
            }
          }
        },
        {
          $lookup: {
            from: "courses",
            let: { id_Courses: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$id_Courses"] },
                  status: "OPEN"
                }
              },
              { $project: { name: 1, tuition_Fees: 1, location: 1 } }
            ],
            as: "fullName"
          }
        },
        {
          $unwind: "$fullName"
        },
        {
          $project: {
            class: 1,
            name: "$fullName.name",
            tuition_Fees: "$fullName.tuition_Fees",
            location: "$fullName.location"
          }
        }
      ]);

      if (!data_courses) data_courses = [];

      return responseOk(res, data_courses);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, "", "error");
    }
  }

  async GetClassById(req, res) {
    try {
      let id_class = req.params.id;
      let discount_code = req.query.discount_code;
      let email = req.query.email;

      let data_class = await class_model
        .findById(id_class)
        .populate([
          {
            path: "id_Courses",
            select: "tuition_Fees name"
          }
        ])
        .select("id_Courses name");
      if (!data_class) return responseError(res, 400, 30, "CLASSALL_NOT_FOUND");

      if (discount_code && email) {
        let data_student = await student_model
          .findOne({ email: email })
          .populate([
            {
              path: "id_debit",
              select: "discount"
            }
          ])
          .select("id_debit");

        if(!data_student) return responseError(res, 400,64, "EMAIL_NOT_FOUND_REGISTER")

        if (
          data_student &&
          data_student.id_debit &&
          data_student.id_debit.discount
        ) {
          let obj_discount = data_student.id_debit.discount.find(
            key => key.discount_code === discount_code
          );

          let tuition_Fees_code = data_class.id_Courses
            ? data_class.id_Courses.tuition_Fees
            : 0;

          if (obj_discount) {
            tuition_Fees_code =
              data_class.id_Courses.tuition_Fees *
              ((100 - obj_discount.sale) / 100);
          }

          let data = {
            _id: data_class ? data_class._id : "",
            name_class: data_class ? data_class.name : "",
            name_courses: data_class.id_Courses
              ? data_class.id_Courses.name
              : "",
            tuition_Fees: data_class.id_Courses
              ? data_class.id_Courses.tuition_Fees
              : 0,
            tuition_Fees_code: tuition_Fees_code
          };

          return responseOk(res, data);
        }
      }

      let data = {
        _id: data_class ? data_class._id : "",
        name_class: data_class ? data_class.name : "",
        name_courses: data_class.id_Courses ? data_class.id_Courses.name : "",
        tuition_Fees: data_class.id_Courses
          ? data_class.id_Courses.tuition_Fees
          : 0,
        tuition_Fees_code: data_class.id_Courses
          ? data_class.id_Courses.tuition_Fees
          : 0
      };

      return responseOk(res, data);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }
}
module.exports = Course;
