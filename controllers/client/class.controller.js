const { _extend } = require("util");
const {
  responseOk,
  responseError,
  paginateAggregate,
} = require("../../helpers/_base_helpers");

const class_model = require("../../models/class.model");
const register_model = require("../../models/registeredLearn.model");

class Class {
  async ScheduleClass(req, res) {
    try {
      let id_student = req.authenticatedClient._id;

      let data_schedule = await register_model.aggregate([
        {
          $match: {
            $and: [{ id_student: id_student }, { payment_status: "APPROVED" }],
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
                  $or: [{ status: "OPEN" }, { status: "STUDYING" }],
                },
              },
              {
                $project: {
                  name: 1,
                  id_Courses: 1,
                  time_day: 1,
                  time_start: 1,
                  time_end: 1,
                  id_teacher: 1,
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
            from: "admins",
            let: { id_teacher: "$id_Class.id_teacher" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$id_teacher"] },
                },
              },
              { $project: { fullName: 1 } },
            ],
            as: "id_teacher",
          },
        },
        {
          $unwind: { path: "$id_teacher", preserveNullAndEmptyArrays: true },
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
            name: "$id_Class.name",
            time_day: "$id_Class.time_day",
            time_start: "$id_Class.time_start",
            time_end: "$id_Class.time_end",
            id_Courses: 1,
            payment_status: 1,
            id_teacher: 1,
          },
        },
      ]);

      return responseOk(res, data_schedule);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async ScoreClass(req, res) {
    try {
      let { page, limit } = req.query;

      let id_student = req.authenticatedClient._id;

      let query = [
        {
          $match: {
            $and: [{ id_student: id_student }, { payment_status: "APPROVED" }],
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
                  $or: [{ status: "CLOSE" }, { status: "STUDYING" }],
                },
              },
              {
                $project: {
                  name: 1,
                  id_Courses: 1,
                  id_teacher: 1,
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
            from: "admins",
            let: { id_teacher: "$id_Class.id_teacher" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$id_teacher"] },
                },
              },
              { $project: { fullName: 1 } },
            ],
            as: "id_teacher",
          },
        },
        { $unwind: "$id_teacher" },
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
            name: "$id_Class.name",
            status: "$id_Class.status",
            score_30: 1,
            score_70: 1,
            total_score: 1,
            id_Courses: 1,
            payment_status: 1,
            id_teacher: 1,
            diploma_code: {
              $cond: [
                {
                  $and: [{ $gte: ["$total_score", 5] }, { status: "CLOSE" }],
                },
                "$diploma_code",
                null,
              ],
            },
          },
        },
      ];

      let data_ScoreClass = await paginateAggregate(
        register_model,
        query,
        page,
        limit
      );

      return responseOk(res, data_ScoreClass);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }
}

module.exports = Class;
