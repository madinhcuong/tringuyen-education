const { _extend } = require("util");
const { responseOk, responseError } = require("../../helpers/_base_helpers");

const registered_model = require("../../models/registeredLearn.model");

class Diploma {
  async GetInforDiploma(req, res) {
    try {
      let diploma_code = req.params.code;

      let data = await registered_model.aggregate([
        {
          $match: {
            $and: [
              { diploma_code: diploma_code },
              { payment_status: "APPROVED" },
              { total_score: { $gte: 5 } }
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
                },
              },
              {
                $project: {
                  name: 1,
                  date: 1,
                  sex: 1,
                  email: 1,
                  phone: 1,
                  address: 1,
                  image: 1,
                },
              },
            ],
            as: "id_student",
          },
        },
        {
          $unwind: "$id_student",
        },
        {
          $lookup: {
            from: "classes",
            let: { id_Class: "$id_Class" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$id_Class"] },
                  status: "CLOSE",
                },
              },
              { $project: { name: 1, id_Courses: 1 } },
            ],
            as: "id_Class",
          },
        },
        {
          $unwind: "$id_Class",
        },
        {
          $lookup: {
            from: "courses",
            let: { id_Courses: "$id_Class.id_Courses" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$id_Courses"] },
                },
              },
              { $project: { name: 1 } },
            ],
            as: "id_Courses",
          },
        },
        {
          $unwind: "$id_Courses",
        },
        {
          $project: {
            id_Courses: 1,
            id_student: 1,
            diploma_code: 1,
            payment_status: 1,
            total_score: 1,
          },
        },
      ]);
      if (data.length < 1)
        return responseError(res, 400, 80, "DIPLOMA_NOT_FOUND");

      return responseOk(res, data[0]);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, "", "error");
    }
  }
}
module.exports = Diploma;
