const { _extend } = require("util");
const {
  responseOk,
  responseError,
  savelogs
} = require("../../helpers/_base_helpers");

const InforTraining_model = require("../../models/inforTraining.model");

class InforTraining {
  async GetListInforTraining(req, res) {
    try {
      let seach_name_inforTraining = req.query.name_inforTraining;
      let seach_name_training = req.query.name_training;
      if (
        !seach_name_inforTraining ||
        seach_name_inforTraining == null ||
        seach_name_inforTraining == undefined ||
        seach_name_inforTraining == ""
      )
        seach_name_inforTraining = "";
      if (
        !seach_name_training ||
        seach_name_training == null ||
        seach_name_training == undefined ||
        seach_name_training == ""
      )
        seach_name_training = "";

      let data_inforTraining = [];
      data_inforTraining = await InforTraining_model.aggregate([
        {
          $match: { name: { $regex: seach_name_inforTraining, $options: "$i" } }
        },
        {
          $lookup: {
            from: "trainings",
            let: { id_training: "$id_training" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$id_training"] },
                  name: {
                    $regex: seach_name_training,
                    $options: "$i"
                  }
                }
              },
              { $project: { name: 1 } }
            ],
            as: "training"
          }
        },
        {
          $project: {
            training: 1,
            name: 1,
            createdAt: 1,
            updatedAt: 1
          }
        },
        {
          $unwind: "$training"
        },
        {
          $unwind: { path: "$training", preserveNullAndEmptyArrays: true }
        },
        { $sort: { createdAt: -1 } }
      ]);

      return responseOk(res, data_inforTraining);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async CreateInforTraining(req, res) {
    try {
      let body = _extend({}, req.body);

      let data = {
        id_training: body.id_training,
        name: body.name,
        image: body.image,
        introduction: body.introduction,
        proviso: body.proviso, // điều kiện
        target: body.target,
        product: body.product,
        certification: body.certification, // chứng nhận
        schedule: body.schedule
      };

      let data_inforTraining = await new InforTraining_model(data).save();
      if (!data_inforTraining)
        return responseError(res, 400, 20, "NOT_CREATE_INFORTRAINING");

      savelogs(
        req.authenticatedAdmin._id,
        "CREATE",
        "Thêm mới thông tin khóa học"
      );

      return responseOk(res, data_inforTraining);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async GetInforTrainingById(req, res) {
    try {
      let id_inforTraining = req.params.id;

      let data = await InforTraining_model.findById(id_inforTraining).populate({
        path: "id_training",
        select: "name"
      });
      if (!data) return responseError(res, 400, 22, "INFOR_TRAINING_NOT_FOUND");

      return responseOk(res, data);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async EditInforTraining(req, res) {
    try {
      let id_inforTraining = req.params.id;
      let body = _extend({}, req.body);

      let data_body = {
        id_training: body.id_training,
        image: body.image,
        name: body.name,
        introduction: body.introduction,
        proviso: body.proviso,
        target: body.target,
        product: body.product,
        certification: body.certification,
        schedule: body.schedule
      };

      let data = await InforTraining_model.findByIdAndUpdate(
        id_inforTraining,
        data_body,
        { new: true }
      );
      if (!data) return responseError(res, 400, 22, "INFOR_TRAINING_NOT_FOUND");

      savelogs(req.authenticatedAdmin._id, "UPDATE", "Sửa đổi thông tin khóa học");

      return responseOk(res, data);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }
}
module.exports = InforTraining;
