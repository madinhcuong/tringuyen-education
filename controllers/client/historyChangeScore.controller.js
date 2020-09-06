const { _extend } = require("util");
const moment = require("moment");
const {
  responseOk,
  responseError,
  create_key,
  searchingQueries,
  pagingOptions,
} = require("../../helpers/_base_helpers");

const paymentHistory_model = require("../../models/paymentHistory.model");

class HistoryChangeScore {
  async HistoryChangeScore(req, res) {
    try {
      let id_student = req.authenticatedClient._id;

      let data = await paymentHistory_model.paginate(
        searchingQueries(req, [], {
          add: {
            id_student: id_student,
            $or: [{ type: "SCORE_CODE" }, { type: "SCORE_MONEY" }],
          },
        }),
        pagingOptions(req, null, "type createdAt change_score", {
          createdAt: -1,
        })
      );

      return responseOk(res, data);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }
}

module.exports = HistoryChangeScore;
