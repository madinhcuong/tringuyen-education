const { _extend } = require("util");
const {
  responseOk,
  responseError,
  savelogs,
  searchingQueries,
  pagingOptions,
  getListIDByModelAndQuery,
} = require("../../helpers/_base_helpers");
const { createNotification } = require("../../helpers/notification.helpers");

const pay_model = require("../../models/pay.model");
const student_model = require("../../models/student.model");
const debit_model = require("../../models/debit.model");
const paymentHistory_model = require("../../models/paymentHistory.model");
const statistic_model = require("../../models/statistic.model");

class Pay {
  async GetListPay(req, res) {
    try {
      let { name, email } = req.query;

      let add = {};
      let listid_student = [];
      if (name || email) {
        let query = {
          $and: [
            { check_learn: true },
            { type: "STUDENT" },
            { name: { $regex: name, $options: "$i" } },
            { email: { $regex: email, $options: "$i" } },
          ],
        };

        listid_student = await getListIDByModelAndQuery(
          student_model,
          query,
          "_id"
        );

        add = {
          id_student: { $in: listid_student },
        };
      }

      let data_pay = await pay_model.paginate(
        searchingQueries(req, [], {
          add: add,
          remove: { name, email },
        }),
        pagingOptions(
          req,
          [
            {
              path: "id_student",
              select: "name date email",
            },
          ],
          "id_student money status description updatedAt createdAt",
          { createdAt: -1 }
        )
      );

      return responseOk(res, data_pay);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async UpdatePay(req, res) {
    try {
      let id_pay = req.params.id;

      let data_pay = await pay_model.findById(id_pay).populate([
        {
          path: "id_student",
          select: "id_debit",
          populate: {
            path: "id_debit",
            select: "money",
          },
        },
      ]);
      if (!data_pay) return responseError(res, 400, 92, "PAY_NOT_FOUND");

      let money_debit = data_pay.id_student.id_debit.money;
      let money_pay = data_pay.money;

      if (money_pay > money_debit)
        return responseError(res, 400, 94, "PAY_NOT_ENOUGH");

      let update_pay = await pay_model.findByIdAndUpdate(
        id_pay,
        {
          status: "APPROVED",
        },
        { new: true }
      );

      // trừ tiền student
      let data_debit = await debit_model.findByIdAndUpdate(
        data_pay.id_student.id_debit._id,
        {
          money: money_debit - money_pay,
        }
      );

      // Lưu log tinh chi tiêu
      let data_paymentHistory_rose = await new paymentHistory_model({
        id_student: data_pay.id_student._id,
        type: "PAY_MONEY",
        money: data_pay.money,
        money_before: money_debit,
        money_after: money_debit - money_pay,
      }).save();

      // tinh lại chi tiêu
      let data_statistic = await statistic_model
        .findOne()
        .select("total_money total_money_cost");

      // lưu thống kê
      if (data_statistic) {
        let total_money_cost = data_statistic.total_money_cost + money_pay;
        let update_total_money = await statistic_model.findByIdAndUpdate(
          data_statistic._id,
          {
            total_money_cost: total_money_cost,
          },
          { new: true }
        );
      }

      await savelogs(
        req.authenticatedAdmin._id,
        "UPDATE",
        "Thanh toán tiền cho học viên"
      );

      // Gửi noti cho user vừa nộp tiền
      let idUser = data_pay.id_student._id;
      let title = "Thanh toán tiền";
      let description = `Bạn vừa được thanh toán ${data_pay.money} nghàn đồng`;
      let data = data_pay;
      let type = "CLIENT";
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
        await io.sockets.in(idUser).emit("GET_LIST_NOTI", description);
      }

      return responseOk(res, "UPDATE_SUCCESS");
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async GetPayById(req, res) {
    try {
      let id_Pay = req.params.id;

      let data_pay = await pay_model
        .findById(id_Pay)
        .populate({
          path: "id_student",
          select: "name date phone sex address email",
        })
        .select("id_student description status createdAt updatedAt");
      if (!data_pay) return responseError(res, 400, 106, "INFOR_PAY_NOT_FOUND");

      return responseOk(res, data_pay);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }
}
module.exports = Pay;
