const { _extend } = require("util");
const { responseOk, responseError } = require("../../helpers/_base_helpers");
const { createNotification } = require("../../helpers/notification.helpers");
const pay_model = require("../../models/pay.model");

class Pay {
  // Yêu cầu thanh toán
  async SendPay(req, res) {
    try {
      let data_student = req.authenticatedClient;
      let body = _extend({}, req.body);
      let { desc } = body;

      // chưa tích đủ điểm đổi tiên
      if (!data_student.id_debit.check_money)
        return responseError(res, 400, 70, "YOU_NOT_EARNED_ENOUGH_POINTS");

      let money = data_student.id_debit.money;
      if (money <= 0) return responseError(res, 400, 90, "MONEY_NOT_ENOUGH");

      let data_pay = await new pay_model({
        id_student: data_student._id,
        money: money,
        description: desc,
        status: "PENDING",
      }).save();

      // Gửi noti cho CMS
      let idUser = null;
      let title = "Thanh toán tiền";
      let description = `${data_student.name} gửi yêu cầu thanh toán tiền`;
      let data = req.authenticatedClient;
      let type = "ADMIN";
      let type_noti = "PAY_STUDENT";
      let result = await createNotification(
        idUser,
        title,
        description,
        data,
        type,
        type_noti
      );
      if (result) {
        io.sockets.in("admin_TN").emit("GET_LIST_NOTI", description);
        io.sockets.in("admin_TN").emit("GET_LIST_PAY_CMS", description);
      }

      return responseOk(res, "SEND_SUCCESS");
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }
}

module.exports = Pay;
