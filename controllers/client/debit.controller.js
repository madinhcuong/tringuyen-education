const { _extend } = require("util");
const moment = require("moment");
const {
  responseOk,
  responseError,
  create_key,
  searchingQueries,
  pagingOptions,
} = require("../../helpers/_base_helpers");
const settings = require("../../helpers/setting.helpers");
const {
  createNotification,
  createNotification_score_transfer,
} = require("../../helpers/notification.helpers");

const debit_model = require("../../models/debit.model");
const paymentHistory_model = require("../../models/paymentHistory.model");
const statistic_model = require("../../models/statistic.model");
const student_model = require("../../models/student.model");
const noti_model = require("../../models/notification.model");

class Debit {
  async ChangeScoreMoney(req, res) {
    try {
      let body = _extend({}, req.body);

      let score_body = +body.score;

      if (
        !req.authenticatedClient &&
        !req.authenticatedClient.id_debit &&
        !req.authenticatedClient.id_debit._id
      )
        return responseError(res, 400, 72, "DEBIT_NOT_FOUND");

      // check điểm xem được đổi tiền chưa
      if (!req.authenticatedClient.id_debit.check_money)
        return responseError(res, 400, 70, "YOU_NOT_EARNED_ENOUGH_POINTS");

      if (score_body <= 0)
        return responseError(res, 400, 76, "ENTER_THE_CORRECT_SCORE");

      if (score_body > req.authenticatedClient.id_debit.wallet)
        return responseError(res, 400, 74, "SCORE_NOT_ENOUGH");

      let id_debit = req.authenticatedClient.id_debit._id;

      // let data_statistic = await statistic_model
      //   .findOne()
      //   .select("total_money_cost total_money");

      // let total_money_cost = 0;
      // if (data_statistic) total_money_cost = data_statistic.total_money_cost;

      if (id_debit) {
        let change_score = score_body * settings.score_x2;

        let wallet = req.authenticatedClient.id_debit.wallet - score_body;
        let money = req.authenticatedClient.id_debit.money + change_score;
        let data_debit = await debit_model.findByIdAndUpdate(id_debit, {
          wallet: wallet,
          money: money,
        });
        if (!data_debit) return responseError(res, 400, 72, "DEBIT_NOT_FOUND");

        // tổng chi
        // total_money_cost = total_money_cost + change_score;

        let data_paymentHistory = await new paymentHistory_model({
          id_student: req.authenticatedClient._id,
          type: "SCORE_MONEY",
          change_score: score_body,
          change_score_before: req.authenticatedClient.id_debit.wallet,
          change_score_after: wallet,
        }).save();

        let data_paymentHistory_rose = await new paymentHistory_model({
          id_student: req.authenticatedClient._id,
          type: "ROSE_MONEY",
          money: change_score,
          money_before: req.authenticatedClient.id_debit.money,
          money_after: money,
        }).save();

        // Gửi noti cho CMS
        let idUser = null;
        let title = "Đổi điểm";
        let description = `${req.authenticatedClient.name} đã đổi ${score_body} điểm`;
        let data = req.authenticatedClient;
        let type = "ADMIN";
        let type_noti = "SCORE";
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
        }

        if (req.authenticatedClient.agent_code) {
          let data_F1 = await student_model
            .findOne({ your_agent: req.authenticatedClient.agent_code })
            .populate([{ path: "id_debit", select: "wallet money" }])
            .select("id_debit agent_code");

          if (data_F1 && data_F1.id_debit._id) {
            // tiền hoa hồng F1
            let money_change_F1 = change_score * settings.rose_F1;

            // tổng tiền F1 sau khi cộng
            let money_F1 = data_F1.id_debit.money + money_change_F1;

            let data_debit_F1 = await debit_model.findByIdAndUpdate(
              data_F1.id_debit._id,
              {
                money: money_F1,
              }
            );

            // tổng chi
            // total_money_cost = total_money_cost + money_change_F1;

            let data_paymentHistory_F1 = await new paymentHistory_model({
              id_student: data_F1._id,
              type: "ROSE_MONEY",
              money: money_change_F1,
              money_before: data_F1.id_debit.money,
              money_after: money_F1,
            }).save();

            // Gửi noti cho user F1
            let idUser = data_F1._id;
            let title = "Tiền hoa hồng";
            let description = `${req.authenticatedClient.name} đã đổi ${score_body} điểm, bạn được cộng ${money_change_F1} VNĐ vào ví tiền`;
            let data = {
              ...{ data_register: req.authenticatedClient },
              agent: "F1",
            };
            let type = "CLIENT";
            let type_noti = "ROSE";
            let result = await createNotification(
              idUser,
              title,
              description,
              data,
              type,
              type_noti
            );
            if (result) {
              io.sockets.in(idUser).emit("GET_LIST_NOTI", description);
            }

            // F2
            if (data_F1.agent_code) {
              let data_F2 = await student_model
                .findOne({ your_agent: data_F1.agent_code })
                .populate([{ path: "id_debit", select: "wallet money" }])
                .select("id_debit agent_code");

              if (data_F2 && data_F2.id_debit._id) {
                // tiền hoa hồng F2
                let money_change_F2 = change_score * settings.rose_F2;

                // tổng tiền F2 sau khi cộng
                let money_F2 = data_F2.id_debit.money + money_change_F2;

                let data_debit_F2 = await debit_model.findByIdAndUpdate(
                  data_F2.id_debit._id,
                  {
                    money: money_F2,
                  }
                );

                // tổng chi
                // total_money_cost = total_money_cost + money_change_F2;

                let data_paymentHistory_F2 = await new paymentHistory_model({
                  id_student: data_F2._id,
                  type: "ROSE_MONEY",
                  money: money_change_F2,
                  money_before: data_F2.id_debit.money,
                  money_after: money_F2,
                }).save();

                // Gửi noti cho user F2
                let idUser = data_F2._id;
                let title = "Tiền hoa hồng";
                let description = `${req.authenticatedClient.name} đã đổi ${score_body} điểm, bạn được cộng ${money_change_F2} VNĐ vào ví tiền`;
                let data = {
                  ...{ data_register: req.authenticatedClient },
                  agent: "F2",
                };
                let type = "CLIENT";
                let type_noti = "ROSE";
                let result = await createNotification(
                  idUser,
                  title,
                  description,
                  data,
                  type,
                  type_noti
                );
                if (result) {
                  io.sockets.in(idUser).emit("GET_LIST_NOTI", description);
                }
              }
            }
          }
        }

        // let update_statistic = await statistic_model.findByIdAndUpdate(
        //   data_statistic._id,
        //   {
        //     total_money_cost: total_money_cost,
        //   }
        // );

        return responseOk(res, "CHANGE_SCORE_SUCCESS");
      }
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async ChangeScoreDiscount(req, res) {
    try {
      let body = _extend({}, req.body);
      let score_check = settings.score_discount(body.key_score);

      if (
        !req.authenticatedClient &&
        !req.authenticatedClient.id_debit &&
        !req.authenticatedClient.id_debit._id
      )
        return responseError(res, 400, 72, "DEBIT_NOT_FOUND");

      if (score_check.score > req.authenticatedClient.id_debit.wallet)
        return responseError(res, 400, 74, "SCORE_NOT_ENOUGH");

      let expiry_date = moment().add(30, "d");

      let date = moment(expiry_date).format("DD/MM/YYYY");

      let wallet = req.authenticatedClient.id_debit.wallet - score_check.score;

      let data_debit = await debit_model.findByIdAndUpdate(
        req.authenticatedClient.id_debit._id,
        {
          $push: {
            discount: {
              discount_code: `DC${create_key()}`,
              sale: score_check.sale,
              expiry_date: expiry_date,
            },
          },
          wallet: wallet,
        },
        { new: true }
      );
      if (!data_debit) return responseError(res, 400, 72, "DEBIT_NOT_FOUND");

      let data_paymentHistory = await new paymentHistory_model({
        id_student: req.authenticatedClient._id,
        type: "SCORE_CODE",
        change_score: score_check.score,
        change_score_before: req.authenticatedClient.id_debit.wallet,
        change_score_after: wallet,
      }).save();

      return responseOk(res, "CHANGE_SCORE_SUCCESS");
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async GetListDiscounts(req, res) {
    try {
      let discount = req.authenticatedClient.id_debit.discount;

      let date_new = moment().format("MM/DD/YYYY");
      let setHours_date_now = new Date(date_new).setHours(0, 0, 0, 0);

      let arr_discount = [];
      for (let item of discount) {
        let expiry_date = moment(item.expiry_date).format("MM/DD/YYYY");
        let setHours_expiry_date = new Date(expiry_date).setHours(0, 0, 0, 0);
        if (setHours_date_now <= setHours_expiry_date) {
          arr_discount.push(item);
        }
      }

      return responseOk(res, arr_discount);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async GetListAff(req, res) {
    try {
      let affF1 = req.authenticatedClient.list_child_agent;
      affF1 = affF1.map((item) => item.id);

      let data = await student_model.paginate(
        searchingQueries(req, ["name", "email"], {
          add: { _id: { $in: affF1 } },
        }),
        pagingOptions(
          req,
          null,
          "agent_code your_agent name image date phone sex address email",
          null
        )
      );

      return responseOk(res, data);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async ScoreTransfer(req, res) {
    try {
      let body = _extend({}, req.body);

      let score_body = +body.score;
      let { agent_code, type } = body;

      if (
        !req.authenticatedClient &&
        !req.authenticatedClient.id_debit &&
        !req.authenticatedClient.id_debit._id
      )
        return responseError(res, 400, 72, "DEBIT_NOT_FOUND");

      // check điểm xem được chuyển điểm chưa
      if (!req.authenticatedClient.id_debit.check_money)
        return responseError(
          res,
          400,
          104,
          "YOU_NOT_EARNED_ENOUGH_POINTS_TRANSFER_SCORE"
        );

      if (score_body <= 0)
        return responseError(res, 400, 76, "ENTER_THE_CORRECT_SCORE");

      if (
        type == "SCORE_SEND" &&
        score_body > req.authenticatedClient.id_debit.wallet
      )
        return responseError(res, 400, 74, "SCORE_NOT_ENOUGH");

      let inforAgentCode = await student_model
        .findOne({
          your_agent: agent_code,
        })
        .populate("id_debit")
        .select("id_debit");

      if (!inforAgentCode)
        return responseError(res, 400, 102, "INFOR_AGENT_CODE_NOT_FOUND");

      // cho điểm
      if (type == "SCORE_SEND") {
        // trừ điểm người gửi
        let id_debit = req.authenticatedClient.id_debit._id;

        let wallet_UserSend = req.authenticatedClient.id_debit.wallet;

        if (score_body > wallet_UserSend)
          return responseError(res, 400, 74, "SCORE_NOT_ENOUGH");

        let debit_sendScore = await debit_model.findByIdAndUpdate(id_debit, {
          wallet: wallet_UserSend - score_body,
        });

        // tổng điểm sau khi được cộng
        let wallet_receiveScore = inforAgentCode.id_debit.wallet + score_body;

        // Check thăng hạng
        let check_addition_score_level = await settings.addition_score_level_wallet(
          inforAgentCode.id_debit.level,
          wallet_receiveScore
        );

        // nếu đủ điêm thì cộng, chỉ cộng 1 lần đầu
        if (check_addition_score_level.addition) {
          wallet_receiveScore =
            wallet_receiveScore + check_addition_score_level.score_addition;
        }

        // data update debit receiveScore
        let updateDebit_receiveScore = {
          wallet: wallet_receiveScore,
        };

        // check trên 500 điểm được đổi tiền
        if (wallet_receiveScore >= settings.on_Score) {
          updateDebit_receiveScore = {
            ...updateDebit_receiveScore,
            check_money: true,
            level: check_addition_score_level.level,
          };
        }

        // Cộng điểm người nhận
        let debit_receiveScore = await debit_model.findByIdAndUpdate(
          inforAgentCode.id_debit._id,
          updateDebit_receiveScore
        );

        let data_paymentHistory = await new paymentHistory_model({
          id_student: req.authenticatedClient._id,
          type: "SCORE_SEND",
          score_transfer: score_body,
        }).save();

        // Gửi noti cho học viên
        let idUser = inforAgentCode._id;
        let title = "Chuyển điểm";
        let description = `${req.authenticatedClient.name} đã chuyển cho bạn ${score_body} điểm`;
        let data = {
          ...{ send_score: req.authenticatedClient },
          ...{ receive_score: inforAgentCode },
        };
        let type = "CLIENT";
        let type_noti = "SCORE_SEND";
        let result = await createNotification(
          idUser,
          title,
          description,
          data,
          type,
          type_noti
        );
        if (result) {
          io.sockets.in(idUser).emit("GET_LIST_NOTI", description);
        }

        // send noti thăng hạng
        if (check_addition_score_level.addition) {
          let idUser = inforAgentCode._id;
          let title = `Thăng hạng`;
          let description = `Chúc mừng bạn đã được thăng hạng ${check_addition_score_level.title}. Bạn được cộng ${check_addition_score_level.score_addition} điểm`;
          let data = {
            ...{ send_score: req.authenticatedClient },
            ...{ receive_score: inforAgentCode },
          };
          let type = "CLIENT";
          let type_noti = "ADDITION_SCORE_LEVEL";
          let result = await createNotification(
            idUser,
            title,
            description,
            data,
            type,
            type_noti
          );
          if (result) {
            io.sockets.in(idUser).emit("GET_LIST_NOTI", description);
          }
        }

        return responseOk(res, "SEND_SCORE_SUCCESS");
      }

      // SCORE_BORROW : xin điểm

      let data_paymentHistory = await new paymentHistory_model({
        id_student: req.authenticatedClient._id,
        type: "SCORE_SEND",
        score_transfer: score_body,
      }).save();

      // Gửi noti cho học viên
      let idUser = inforAgentCode._id;
      let title = "Chuyển điểm";
      let description = `${req.authenticatedClient.name} đã gửi yêu cầu xin ${score_body} điểm của bạn`;
      let data = {
        ...{ send_score: req.authenticatedClient },
        ...{ receive_score: inforAgentCode },
      };
      let type_noti = "SCORE_BORROW";
      let score_transfer = score_body;
      let result = await createNotification_score_transfer(
        idUser,
        title,
        description,
        data,
        "CLIENT",
        type_noti,
        score_transfer
      );
      if (result) {
        io.sockets.in(idUser).emit("GET_LIST_NOTI", description);
      }

      return responseOk(res, "Data");
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async VeriScoreTransfer(req, res) {
    try {
      let id_noti = req.params.id_noti;
      let body = _extend({}, req.body);
      let type = body.type;

      // từ chối
      if (type == "REJECT") {
        console.log("id_noti", id_noti);

        let dataNoti = await noti_model
          .findByIdAndUpdate(
            id_noti,
            {
              status_score_transfer: type,
            },
            { new: true }
          )
          .select("data score_transfer");

        if (dataNoti.data) {
          let id_sendNoti = dataNoti.data.send_score
            ? dataNoti.data.send_score._id
            : "";
          if (id_sendNoti) {
            // Gửi noti thông báo từ chối chuyển cho học viên
            let idUser = id_sendNoti;
            let title = "Chuyển điểm";
            let description = `${req.authenticatedClient.name} đã từ chối chuyển cho bạn ${dataNoti.score_transfer} điểm`;
            let data = {
              id_send_Noti: req.authenticatedClient,
              id_receive: idUser,
            };
            let type_noti = "VERI_TRANSFER_SCORE";
            let result = await createNotification(
              idUser,
              title,
              description,
              data,
              "CLIENT",
              type_noti
            );
            if (result) {
              io.sockets.in(idUser).emit("GET_LIST_NOTI", description);
            }
          }
        }

        return responseOk(res, "UPDATE_SUCCESS");
      }

      // dong y chuyen diem
      if (type == "APPROVE") {
        let id_user = req.authenticatedClient._id;

        let dataNoti = await noti_model
          .findById(id_noti)
          .select("data score_transfer");

        if (!dataNoti)
          responseError(res, 400, 102, "INFOR_AGENT_CODE_NOT_FOUND");

        if (dataNoti.data) {
          // check vi tien cua minh
          if (
            !req.authenticatedClient &&
            !req.authenticatedClient.id_debit &&
            !req.authenticatedClient.id_debit._id
          )
            return responseError(res, 400, 72, "DEBIT_NOT_FOUND");

          // check điểm xem được chuyển điểm chưa
          if (!req.authenticatedClient.id_debit.check_money)
            return responseError(
              res,
              400,
              104,
              "YOU_NOT_EARNED_ENOUGH_POINTS_TRANSFER_SCORE"
            );

          if (dataNoti.score_transfer > req.authenticatedClient.id_debit.wallet)
            return responseError(res, 400, 74, "SCORE_NOT_ENOUGH");

          // update status hiện an button noti
          let update_noti = await noti_model.findByIdAndUpdate(id_noti, {
            status_score_transfer: "APPROVE",
          });

          // infor người xin điểm
          let idUser_send = dataNoti.data.send_score
            ? dataNoti.data.send_score._id
            : "";

          let infor_receiveScore = await student_model
            .findById(idUser_send)
            .populate("id_debit")
            .select("id_debit");

          if (!infor_receiveScore)
            return responseError(res, 400, 102, "INFOR_AGENT_CODE_NOT_FOUND");

          // trừ điểm minh
          let data_user = req.authenticatedClient;

          let debit_user = await debit_model.findByIdAndUpdate(
            data_user.id_debit._id,
            {
              wallet: data_user.id_debit.wallet - dataNoti.score_transfer,
            },
            { new: true }
          );

          // tổng điểm sau khi được cộng
          let wallet_receiveScore =
            infor_receiveScore.id_debit.wallet + dataNoti.score_transfer;

          // Check thăng hạng
          let check_addition_score_level = await settings.addition_score_level_wallet(
            infor_receiveScore.id_debit.level,
            wallet_receiveScore
          );

          // nếu đủ điêm thì cộng, chỉ cộng 1 lần đầu
          if (check_addition_score_level.addition) {
            wallet_receiveScore =
              wallet_receiveScore + check_addition_score_level.score_addition;
          }

          // data update debit receiveScore
          let updateDebit_receiveScore = {
            wallet: wallet_receiveScore,
          };

          // check trên 500 điểm được đổi tiền
          if (wallet_receiveScore >= settings.on_Score) {
            updateDebit_receiveScore = {
              ...updateDebit_receiveScore,
              check_money: true,
              level: check_addition_score_level.level,
            };
          }

          // Cộng điểm người nhận
          let debit_receiveScore = await debit_model.findByIdAndUpdate(
            infor_receiveScore.id_debit._id,
            updateDebit_receiveScore
          );

          let data_paymentHistory = await new paymentHistory_model({
            id_student: data_user._id,
            type: "SCORE_SEND",
            score_transfer: dataNoti.score_transfer,
          }).save();

          // Gửi noti cho học viên xin điểm
          let idUser = idUser_send;
          let title = "Chuyển điểm";
          let description = `${data_user.name} đã chuyển cho bạn ${dataNoti.score_transfer} điểm`;
          let data = {
            ...{ send_score: data_user },
            ...{ receive_score: infor_receiveScore },
          };
          let type = "CLIENT";
          let type_noti = "SCORE_SEND";
          let result = await createNotification(
            idUser,
            title,
            description,
            data,
            type,
            type_noti
          );
          if (result) {
            io.sockets.in(idUser).emit("GET_LIST_NOTI", description);
          }

          // send noti thăng hạng
          if (check_addition_score_level.addition) {
            let idUser = idUser_send;
            let title = `Thăng hạng`;
            let description = `Chúc mừng bạn đã được thăng hạng ${check_addition_score_level.title}. Bạn được cộng ${check_addition_score_level.score_addition} điểm`;
            let data = {
              ...{ send_score: data_user },
              ...{ receive_score: infor_receiveScore },
            };
            let type = "CLIENT";
            let type_noti = "ADDITION_SCORE_LEVEL";
            let result = await createNotification(
              idUser,
              title,
              description,
              data,
              type,
              type_noti
            );
            if (result) {
              io.sockets.in(idUser).emit("GET_LIST_NOTI", description);
            }
          }
        }

        return responseOk(res, "UPDATE_SUCCESS");
      }

      return responseOk(res, "data");
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }
}

module.exports = Debit;
