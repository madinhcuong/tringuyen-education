const { _extend } = require("util");
const {
  responseOk,
  responseError,
  savelogs
} = require("../../helpers/_base_helpers");

const Training_model = require("../../models/training.model");

class Training {
  async GetInforTraining(req, res) {
    try {
      let seach_name = req.query.seach_name;
      if (seach_name == null || seach_name == undefined) seach_name = "";

      let data = await Training_model.aggregate([
        { $match: { name: { $regex: seach_name, $options: "$i" } } },
        { $sort: { createdAt: -1 } }
      ]);

      return responseOk(res, data);
    } catch (err) {
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async GetListTrainingByTeacher(req, res) {
    try {
      let data = await Training_model.aggregate([
        { $project: { name: 1 } },
        { $sort: { createdAt: -1 } }
      ]);

      return responseOk(res, data);
    } catch (err) {
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async CreateTraining(req, res) {
    try {
      let body = _extend({}, req.body);
      let data = await new Training_model({ name: body.name }).save();
      if (!data) return responseError(res, 400, 6, "NOT_CREATE_TRAINING");

      savelogs(req.authenticatedAdmin._id, "CREATE", "thêm mới đào tạo");

      return responseOk(res, data);
    } catch (err) {
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async UpdateTraining(req, res) {
    try {
      let body = _extend({}, req.body);
      let id_training = req.params.id;

      let data_training = await Training_model.findByIdAndUpdate(
        id_training,
        {
          name: body.name
        },
        { new: true }
      );
      if (!data_training)
        return responseError(res, 400, 8, "TRAINING_NOT_FOUND");

      savelogs(req.authenticatedAdmin._id, "UPDATE", "Sửa hệ đào tạo");

      return responseOk(res, data_training);
    } catch (err) {
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async DeleteTraining(req, res) {
    let id_training = req.params.id;

    let data_training = await Training_model.findByIdAndDelete(id_training);
    if (!data_training) return responseError(res, 400, 8, "TRAINING_NOT_FOUND");

    savelogs(req.authenticatedAdmin._id, "DELETE", "Xóa hệ đào tạo");

    return responseOk(res, "DELETE_SUCCESS");
  }
  catch(err) {
    return responseError(res, 500, 0, "ERROR");
  }
}
module.exports = Training;
