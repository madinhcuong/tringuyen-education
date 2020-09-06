const { _extend } = require("util");
const {
  responseOk,
  responseError,
  savelogs
} = require("../../helpers/_base_helpers");

const Training_model = require("../../models/training.model");

class Training {
  async GetListTraining(req, res) {
    try {
      let data = await Training_model.aggregate([
        { $project: { name: 1, img: 1 } },
        { $sort: { createdAt: -1 } }
      ]);

      return responseOk(res, data);
    } catch (err) {
      return responseError(res, 500, 0, "ERROR");
    }
  }
}
module.exports = Training;
