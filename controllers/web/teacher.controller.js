const { _extend } = require("util");
const { responseOk, responseError } = require("../../helpers/_base_helpers");

const teacher_model = require("../../models/admin.model");

class Teacher {
  async GetListTeacher(req, res) {
    try {
      let data = await teacher_model.aggregate([
        {
          $match: {
            type: "TEACHER",
            status: "ACTIVATE"
          }
        },
        { $project: { fullName: 1, avatar: 1, depict: 1, createdAt: 1 } },
        { $sort: { createdAt: -1 } },
        { $limit: 8 }
      ]);

      return responseOk(res, data);
    } catch (err) {
      return responseError(res, 500, 0, "ERROR");
    }
  }
}
module.exports = Teacher;
