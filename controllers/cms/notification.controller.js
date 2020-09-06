const {
  responseOk,
  responseError,
  paginateAggregate,
} = require("../../helpers/_base_helpers");

const noti_model = require("../../models/notification.model");

class Noti {
  async GetListNoti(req, res) {
    try {
      let { page, limit } = req.query;

      page = page > 0 ? +page : 1;
      limit = limit > 0 ? +limit : 10;

      let count_noti_new = await noti_model.aggregate([
        {
          $match: {
            $and: [{ type: "ADMIN" }, { check_Click_Noti: false }],
          },
        },
        { $count: "total" },
      ]);

      let query = [
        {
          $match: {
            type: "ADMIN",
          },
        },
        {
          $project: {
            title: 1,
            description: 1,
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ];

      let data_noti = await paginateAggregate(
        noti_model,
        query,
        page,
        limit,
        count_noti_new[0] ? count_noti_new[0].total : 0
      );

      return responseOk(res, data_noti);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  // ckeck click xem noti
  async CheckClickNoti(req, res) {
    try {
      let data = await noti_model.updateMany(
        { type: "ADMIN", check_Click_Noti: false },
        { $set: { check_Click_Noti: true } }
      );

      return responseOk(res, "UPDATE_SUCCESS");
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }
}

module.exports = Noti;
