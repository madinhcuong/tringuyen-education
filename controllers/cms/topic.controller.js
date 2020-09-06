const { _extend } = require("util");
const {
  responseOk,
  responseError,
  savelogs
} = require("../../helpers/_base_helpers");

const Topic_model = require("../../models/topic.model");

class Topic {
  async getInforTopic(req, res) {
    try {
      let { seach_name } = req.query;
      if (seach_name == null || seach_name == undefined) seach_name = "";

      //     let query = { name_topic: { $regex: seach_name, $options: '$i' } };
      //     let options = {
      //        // page: parseInt(page, 10),
      //         sort: { createdAt: -1 }
      //     };
      //    let data = await Topic_model.paginate(query, options);

      let data = await Topic_model.aggregate([
        { $match: { name_topic: { $regex: seach_name, $options: "$i" } } },
        { $sort: { createdAt: -1 } }
      ]);

      return responseOk(res, data);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "error");
    }
  }

  async GetListTopicByNews(req, res) {
    try {
      let data = await Topic_model.find().select("name_topic");
      return responseOk(res, data);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "error");
    }
  }

  async GetTopicById(req, res) {
    try {
      let id_topic = req.params.id;
      let data = await Topic_model.findOne({ _id: id_topic });
      if (!data) return responseError(res, 400, 2, "TOPIC_NOT_FOUND");
      return responseOk(res, data);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "error");
    }
  }

  async CreateNewTopic(req, res) {
    try {
      let { name_topic } = req.body;
      let data = await new Topic_model({
        name_topic: name_topic
      }).save();

      savelogs(req.authenticatedAdmin._id, "CREATE", "Thêm mới chủ đề tin tức");
      return responseOk(res, data);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, "", "error");
    }
  }

  async UpdateTopic(req, res) {
    try {
      let id_topic = req.params.id;
      let body = _extend({}, req.body);

      let data = await Topic_model.findByIdAndUpdate(
        id_topic,
        { name_topic: body.name_topic },
        { new: true }
      );
      if (!data) return responseError(res, 400, 2, "TOPIC_NOT_FOUND");

      savelogs(req.authenticatedAdmin._id, "UPDATE", "Sửa đổi thông tin chủ đề");

      return responseOk(res, data);
      // return responseOk(res, "UPDATE_SUCCESS");
    } catch (err) {
      console.log(err);
      return responseError(res, 500, "", "error");
    }
  }

  async DeleteTopic(req, res) {
    try {
      let params = req.params.id;

      let data = await Topic_model.findByIdAndDelete(params);
      if (!data) return responseError(res, 400, 2, "TOPIC_NOT_FOUND");

      savelogs(req.authenticatedAdmin._id, "DELETE", "Xóa chủ đề");

      return responseOk(res, "DELETE_SUCCESS");
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }
}
module.exports = Topic;
