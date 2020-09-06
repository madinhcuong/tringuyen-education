const { responseOk, responseError } = require("../../helpers/_base_helpers");

const Logs_model = require("../../models/logs.model");

class Logs {
  async GetListLogs(req, res) {
    try {
      let data_Logs = await Logs_model.aggregate([
        {
          $lookup: {
            from: "admins",
            let: { id_user: "$id_user" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$id_user"] } } },
              { $project: { fullName: 1 } }
            ],
            as: "id_user"
          }
        },
        {
          $project: {
            action: 1,
            id_user: 1,
            content: 1,
            createdAt: 1
          }
        },
        {
          $unwind: "$id_user"
        },
        {
          $unwind: { path: "$id_user", preserveNullAndEmptyArrays: true }
        },
        { $sort: { createdAt: -1 } }
      ]);

      return responseOk(res, data_Logs);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }
}

module.exports = Logs;
