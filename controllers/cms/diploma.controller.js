const {
  responseOk,
  responseError,
  searchingQueries,
  pagingOptions,
  paginateAggregate,
} = require("../../helpers/_base_helpers");

const register_model = require("../../models/registeredLearn.model");
const student_model = require("../../models/student.model");

class Diploma {
  async GetListDiploma(req, res) {
    try {
      let { name, email, page, limit } = req.query;

      let query = [
        {
          $match: {
            $and: [
              { total_score: { $gte: 5 } },
              { payment_status: "APPROVED" },
            ],
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
                  status: "CLOSE",
                },
              },
              {
                $project: {
                  name: 1,
                  id_Courses: 1,
                  status: 1,
                },
              },
            ],
            as: "id_Class",
          },
        },
        {
          $unwind: "$id_Class",
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
                    $regex: name,
                    $options: "$i",
                  },
                  email: {
                    $regex: email,
                    $options: "$i",
                  },
                },
              },
              { $project: { name: 1, date: 1, email: 1 } },
            ],
            as: "id_student",
          },
        },
        {
          $unwind: "$id_student",
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
            id_Class: 1,
            id_student: 1,
            payment_status: 1,
            total_score: 1,
            diploma_code: 1,
            createdAt: 1,
            id_Courses: 1,
          },
        },
      ];

      let data_diploma = await paginateAggregate(
        register_model,
        query,
        page,
        limit
      );

      return responseOk(res, data_diploma);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async GetDiplomaById(req, res) {
    try {
      let id_register = req.params.id;

      let data = await register_model
        .findById(id_register)
        .populate([
          {
            path: "id_Class id_student",
            select: "name date email sex address phone image",
            populate: {
              path: "id_Courses",
              select: "name",
            },
          },
        ])
        .select(
          "id_Class id_student score_30 score_70 total_score diploma_code"
        );
      if (!data) return responseError(res, 400, 48, "REGISTER_LEARN_NOT_FOUND");

      return responseOk(res, data);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }
}

module.exports = Diploma;
