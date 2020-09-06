const { _extend } = require("util");
const bcrypt = require("bcrypt");
const {
  responseOk,
  responseError,
  savelogs,
  searchingQueries,
  pagingOptions,
} = require("../../helpers/_base_helpers");

const registeredLearn_model = require("../../models/registeredLearn.model");
const student_model = require("../../models/student.model");
const debit_model = require("../../models/debit.model");
const statistic_model = require("../../models/statistic.model");
const courses_model = require("../../models/courses.model");

class ScoreCumulative {
  async GetListScoreCumulative(req, res) {
    try {
      let seach_name_student = req.query.name;
      let seach_name_email = req.query.email;
      if (
        !seach_name_student ||
        seach_name_student == null ||
        seach_name_student == undefined ||
        seach_name_student == ""
      )
        seach_name_student = "";

      if (
        !seach_name_email ||
        seach_name_email == null ||
        seach_name_email == undefined ||
        seach_name_email == ""
      )
        seach_name_email = "";

      let data_student = await student_model.aggregate([
        {
          $match: {
            $and: [
              { check_learn: true },
              { type: "STUDENT" },
              { name: { $regex: seach_name_student, $options: "$i" } },
              { email: { $regex: seach_name_email, $options: "$i" } },
            ],
          },
        },
        {
          $lookup: {
            from: "debits",
            let: { id_debit: "$id_debit" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$id_debit"] },
                },
              },
              { $project: { wallet: 1, level:1 } },
            ],
            as: "id_debit",
          },
        },
        {
          $project: {
            id_debit: 1,
            name: 1,
            date: 1,
            sex: 1,
            email: 1,
            phone: 1,
            address: 1,
            createdAt: 1,
          },
        },
        {
          $unwind: "$id_debit",
        },
        {
          $unwind: { path: "$id_debit", preserveNullAndEmptyArrays: true },
        },
        { $sort: { "id_debit.wallet": -1 } },
      ]);

      return responseOk(res, data_student);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async GetScoreCumulativeByID(req, res) {
    try {
      let id_score = req.params.id;

      let data_score = await student_model
        .findById(id_score)
        .populate([
          {
            path: "id_debit",
            select: "wallet money discount",
          },
        ])
        .select(
          "your_agent agent_code name sex date image phone address email"
        );

      if (!data_score)
        return responseError(res, 400, 60, "SCORE_CUMULATIVE_NOT_FOUND");

      return responseOk(res, data_score);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async getAffiliateUserListById(req, res) {
    try {
      let id_student = req.params.id;
      let { type } = req.query;

      // type: "F1" or "F2"

      let data_student = await student_model
        .findById(id_student)
        .select("list_child_agent");
      if (!data_student)
        return responseError(res, 400, 44, "STUDENT_NOT_FOUND");

      let affF1 = data_student.list_child_agent;
      affF1 = affF1.map((item) => item.id);

      let data = await student_model.paginate(
        searchingQueries(req, ["name", "email"], {
          add: { _id: { $in: affF1 } },
          remove: { type },
        }),
        pagingOptions(
          req,
          null,
          "agent_code your_agent name image date phone sex address email",
          null
        )
      );

      // F1
      if (type == "F1") return responseOk(res, data);

      let data_temp = [];
      for (let itemF2 of affF1) {
        let infoF2 = await student_model
          .findById(itemF2)
          .select("list_child_agent");

        let affF2 = infoF2.list_child_agent;
        affF2 = affF2.map((e) => e.id);

        data_temp.push(...affF2);
      }

      let dataF2 = await student_model.paginate(
        searchingQueries(req, ["name", "email"], {
          add: { _id: { $in: data_temp } },
          remove: { type },
        }),
        pagingOptions(
          req,
          null,
          "agent_code your_agent name image date phone sex address email",
          null
        )
      );

      return responseOk(res, dataF2);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }
}

module.exports = ScoreCumulative;
