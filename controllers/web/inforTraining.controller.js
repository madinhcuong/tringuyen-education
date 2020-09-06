const { _extend } = require("util");
const {
  responseOk,
  responseError,
  savelogs
} = require("../../helpers/_base_helpers");

const infortraining_model = require("../../models/inforTraining.model");

class InforTraining {
  async GetListInforTrainingById(req, res) {
    try {
      let query = {};
      let pageOptions = {
        page: req.query.page || 1,
        limit: 10
      };
      let id_training = req.params.id;

      infortraining_model
        .paginate(
          {
            id_training: id_training
          },
          {
            populate: [
              {
                path: "id_training",
                select: "name "
              }
            ],
            select: "name image",
            page: pageOptions.page,
            limit: pageOptions.limit
          }
        )
        .then(result => {
          return responseOk(res, result);
        });
    } catch (err) {
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async GetInforTrainingById(req, res) {
    try {
      let id_inforTraining = req.params.id;
      
      let data_inforTraining = await infortraining_model
        .findById(id_inforTraining)
        .select("image name introduction content proviso target product certification");
      if (!data_inforTraining) return responseError(res, 400, 22, "INFOR_TRAINING_NOT_FOUND");

      return responseOk(res, data_inforTraining);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }
}
module.exports = InforTraining;
