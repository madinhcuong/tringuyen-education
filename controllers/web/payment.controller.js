const { _extend } = require("util");
const paypal = require("paypal-rest-sdk");
const bcrypt = require("bcrypt");
const moment = require("moment");
const querystring = require("qs");
const sha256 = require("sha256");
const uuidv4 = require("uuid/v4");
const https = require("https");
const crypto = require("crypto");
const {
  responseOk,
  responseError,
  create_key,
  slug,
  createDiplomaCode,
  remove_space_url_payment,
  remove_key_payment,
  nameFormat,
} = require("../../helpers/_base_helpers");
const { createNotification } = require("../../helpers/notification.helpers");
const { check_time_discount } = require("../../helpers/check_time.helpers");
const setting = require("../../helpers/setting.helpers");
const {
  vn_pay,
  configure_paypal,
  paypal_return,
  getMomoConfig,
} = require("../../config/payment.config");

//--send mail
const nodemailer = require("nodemailer");
const {
  teamplate_send_mailCourses,
} = require("../../helpers/template_sendMailCourses");
const { transporter_config } = require("../../config/nodemailer.config");
//--end send mail

let {
  hostname,
  hostname_noHTTPS,
  endpoint,
  serectkey,
  partnerCode,
  accessKey,
  returnUrl,
  notifyurl,
  path,
  orderInfo,
  requestType,
} = getMomoConfig("DEVELOPMENT");

const class_model = require("../../models/class.model");
const student_model = require("../../models/student.model");
const registerLearn_model = require("../../models/registeredLearn.model");
const debit_model = require("../../models/debit.model");
const statistic_model = require("../../models/statistic.model");
const paymentHistory_model = require("../../models/paymentHistory.model");
const tableDraft_model = require("../../models/tableDraft.model");

let transporter = nodemailer.createTransport(transporter_config);

// config paypal
paypal.configure(configure_paypal);

// kiểm tra data có trùng ko,... mới được thanh toán
CheckDataRegister = async (req, res) => {
  let body = _extend({}, req.body);

  let data_class = await class_model
    .findById(body.id_class)
    .populate([
      {
        path: "id_Courses",
        select: "tuition_Fees name",
      },
    ])
    .select("id_Courses name");
  if (!data_class) return responseError(res, 400, 30, "CLASSALL_NOT_FOUND");

  let data_student = await student_model
    .findOne({
      email: body.email,
      type: "STUDENT",
    })
    .populate([{ path: "id_debit", select: "discount" }])
    .select("id_debit");

  // chưa có tk check email trùng
  if (data_student && body.check_account_val == "NOACCOUNT")
    return responseError(res, 400, 18, "EMAIL_DUPLICATE");

  // đã có tk email check ko tìm thấy
  if (!data_student && body.check_account_val == "ACCOUNT")
    return responseError(res, 400, 64, "EMAIL_NOT_FOUND_REGISTER");

  if (data_class && data_student) {
    let check_class = await registerLearn_model.findOne({
      id_student: data_student._id,
      id_Class: data_class._id,
    });
    if (check_class) return responseError(res, 400, 46, "CLASS_DUPLICATE");
  }

  // tiền thanh toán
  let tuition_Fees_discount = data_class.id_Courses.tuition_Fees;

  // có mã giảm giá
  if (body.check_account_val == "ACCOUNT") {
    let obj_discount = data_student.id_debit.discount.find(
      (key) => key.discount_code === body.discount_code
    );

    // check time discount_code và tính sale
    if (obj_discount && check_time_discount(obj_discount.expiry_date)) {
      tuition_Fees_discount =
        data_class.id_Courses.tuition_Fees * ((100 - obj_discount.sale) / 100);
    }
  }

  if (tuition_Fees_discount == 0)
    return responseError(res, 400, 86, "CHECK_DISCOUNT_100_LOCAL");

  return { tuition_Fees_discount, data_class };
};

Create_Register = async (body, res) => {
  let data_class = await class_model
    .findById(body.id_class)
    .populate([
      {
        path: "id_Courses",
        select: "tuition_Fees name",
      },
    ])
    .select("id_Courses name");
  if (!data_class) return responseError(res, 400, 30, "CLASSALL_NOT_FOUND");

  let data_student = await student_model
    .findOne({
      email: body.email,
      type: "STUDENT",
    })
    .populate([{ path: "id_debit", select: "discount" }])
    .select("id_debit");

  // chưa có tk check email trùng
  if (data_student && body.check_account_val == "NOACCOUNT")
    return responseError(res, 400, 18, "EMAIL_DUPLICATE");

  // đã có tk email check ko tìm thấy
  if (!data_student && body.check_account_val == "ACCOUNT")
    return responseError(res, 400, 64, "EMAIL_NOT_FOUND_REGISTER");

  if (data_class && data_student) {
    let check_class = await registerLearn_model.findOne({
      id_student: data_student._id,
      id_Class: data_class._id,
    });
    if (check_class) return responseError(res, 400, 46, "CLASS_DUPLICATE");
  }

  // đã có tk: ACCOUNT
  // chưa có tk: NOACCOUNT

  // TH chưa có tài khoản
  if (body.check_account_val == "NOACCOUNT") {
    let data_debit = await new debit_model().save();

    let data_body = {
      password: bcrypt.hashSync(slug(body.date), 10),
      email: body.email,
      // address: body.address,
      // sex: body.sex,
      phone: body.phone,
      date: body.date,
      name: body.name,
      agent_code: body.agent_code,
      your_agent: create_key(),
      id_debit: data_debit._id,
      type: "STUDENT",
      list_child_agent: [],
    };

    let create_student = await new student_model(data_body).save();

    let save_register = await new registerLearn_model({
      id_Class: data_class._id,
      id_student: create_student._id,
      tuition_Fees: data_class.id_Courses.tuition_Fees,
      tuition_Fees_discount: data_class.id_Courses.tuition_Fees,
      payment_method: body.payment_method,
      diploma_code: createDiplomaCode(),
      new_regis: body.check_account_val,
    }).save();

    if (body.agent_code && body.agent_code != "") {
      let data_agent_code = await student_model.findOneAndUpdate(
        { your_agent: body.agent_code },
        {
          $push: {
            list_child_agent: { id: create_student._id.toString() },
          },
        }
      );
    }

    return save_register;
  }

  if (body.check_account_val == "ACCOUNT") {
    let obj_discount = data_student.id_debit.discount.find(
      (key) => key.discount_code === body.discount_code
    );

    let tuition_Fees_discount = data_class.id_Courses
      ? data_class.id_Courses.tuition_Fees
      : 0;

    // check time discount_code và tính sale
    if (obj_discount && check_time_discount(obj_discount.expiry_date)) {
      tuition_Fees_discount =
        data_class.id_Courses.tuition_Fees * ((100 - obj_discount.sale) / 100);
    }

    let data = {
      id_Class: data_class._id,
      id_student: data_student._id,
      sale_percent: obj_discount ? obj_discount.sale : 0,
      tuition_Fees: data_class.id_Courses.tuition_Fees,
      tuition_Fees_discount: tuition_Fees_discount,
      payment_method: body.payment_method,
      diploma_code: createDiplomaCode(),
      new_regis: body.check_account_val,
    };

    let save_register = await new registerLearn_model(data).save();

    if (obj_discount) {
      await debit_model.updateOne(
        { _id: data_student.id_debit._id },
        {
          $pull: {
            discount: { discount_code: obj_discount.discount_code },
          },
        }
      );
    }

    return save_register;
  }
};

UpdateStatusPayment = async (req, res, id_register) => {
  // thay đổi status
  let data_register = await registerLearn_model
    .findByIdAndUpdate(
      id_register,
      {
        payment_status: "APPROVED",
        payment_date: new Date(),
      },
      { new: true }
    )
    .populate([
      {
        path: "id_student id_Class",
        populate: {
          path: "id_debit",
          select: "wallet tuition_Fees",
        },
        select: "id_debit agent_code your_agent name",
      },
    ])
    .select(
      "id_student payment_status tuition_Fees_discount tuition_Fees new_regis"
    );
  if (!data_register)
    return responseError(res, 400, 48, "REGISTER_LEARN_NOT_FOUND");

  // Cộng tiền tổng doanh thu đăng ký Học
  let data_statistic = await statistic_model
    .findOne()
    .select("total_money total_money_cost");

  // thu
  let total_money_statistics = 0;
  // chi
  let total_money_cost = 0;
  if (data_statistic) {
    total_money_statistics =
      data_statistic.total_money + data_register.tuition_Fees_discount;
    // total_money_cost = data_statistic.total_money_cost;
  }

  let data_student = await student_model.findByIdAndUpdate(
    data_register.id_student._id,
    {
      check_learn: true,
    }
  );
  if (!data_student) return responseError(res, 400, 44, "STUDENT_NOT_FOUND");

  // Gửi noti cho user vừa nộp tiền
  let idUser = data_register.id_student._id;
  let title = "Nộp tiền học";
  let description = `Bạn đã nộp tiền học lớp ${data_register.id_Class.name} thành công`;
  let data = data_register;
  let type = "CLIENT";
  let type_noti = "MONEY_LEARN";
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

  // Cộng điểm và hoa hồng người giới thiệu F1
  let data_F1 = {};
  if (
    data_register.id_student.agent_code &&
    data_register.id_student.agent_code != ""
  ) {
    data_F1 = await student_model
      .findOne({
        your_agent: data_register.id_student.agent_code,
      })
      .populate([
        {
          path: "id_debit",
          select: "wallet money level",
        },
      ])
      .select("id_debit agent_code");

    if (data_F1 && data_F1.id_debit) {
      // tính điểm F1 và lấy phần nguyên
      let total_scores_F1 = 0;
      // check người mk giới thiệu đăng ký mới or đã có account
      if (data_register.new_regis == "NOACCOUNT") {
        total_scores_F1 = Math.floor(
          data_register.tuition_Fees * setting.score_F1
        );
      }

      // tính hoa hồng F1
      let total_rose_F1 = data_register.tuition_Fees * setting.rose_F1;

      // tổng điểm sau khi được cộng
      let wallet_after_F1 = data_F1.id_debit.wallet + total_scores_F1;

      // Check thăng hạng
      let check_addition_score_level = await setting.addition_score_level_wallet(
        data_F1.id_debit.level,
        wallet_after_F1
      );

      // nếu đủ điêm thì cộng, chỉ cộng 1 lần đầu
      if (check_addition_score_level.addition) {
        wallet_after_F1 =
          wallet_after_F1 + check_addition_score_level.score_addition;
      }

      // data update debit F1
      let updateDebit_F1 = {
        wallet: wallet_after_F1,
        money: data_F1.id_debit.money + total_rose_F1,
      };

      // check trên 500 điểm được đổi tiền
      //  if (wallet_after_F1 >= setting.on_Score) check_money_F1 = true;
      if (wallet_after_F1 >= setting.on_Score) {
        updateDebit_F1 = {
          ...updateDebit_F1,
          check_money: true,
          level: check_addition_score_level.level,
        };
      }

      // Cộng tiền và điểm F1
      let debit_F1 = await debit_model.findByIdAndUpdate(
        data_F1.id_debit._id,
        updateDebit_F1
      );

      // Lưu log tinh chi tiêu
      let data_paymentHistory_rose = await new paymentHistory_model({
        id_student: data_F1._id,
        type: "ROSE_MONEY",
        money: total_rose_F1,
        money_before: data_F1.id_debit.money,
        money_after: data_F1.id_debit.money + total_rose_F1,
      }).save();

      // Tổng chi
      //  total_money_cost = total_money_cost + total_rose_F1;

      // Gửi noti cho user được cộng điểm và tiền hoa hồng F1
      let idUser = data_F1._id;
      let title =
        data_register.new_regis == "NOACCOUNT"
          ? "Cộng điểm và tiền hoa hồng"
          : "Tiền hoa hồng";
      let description =
        data_register.new_regis == "NOACCOUNT"
          ? `${data_register.id_student.name} vừa nộp tiền học. Bạn được cộng ${total_scores_F1} điểm và được cộng ${total_rose_F1} vnđ tiền hoa hồng`
          : `${data_register.id_student.name} vừa nộp tiền học. Bạn được cộng ${total_rose_F1} vnđ tiền hoa hồng`;
      let data = { ...{ data_register }, agent: "F1" };
      let type = "CLIENT";
      let type_noti =
        data_register.new_regis == "NOACCOUNT"
          ? "ROSE_AND_SCORE"
          : "ROSE_LEARN";
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
        let idUser = data_F1._id;
        let title = `Thăng hạng`;
        let description = `Chúc mừng bạn đã được thăng hạng ${check_addition_score_level.title}. Bạn được cộng ${check_addition_score_level.score_addition} điểm`;
        let data = { ...{ data_register }, agent: "F1" };
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
  }

  if (data_F1 && data_F1.agent_code) {
    let data_F2 = await student_model
      .findOne({
        your_agent: data_F1.agent_code,
      })
      .populate([
        {
          path: "id_debit",
          select: "wallet money level",
        },
      ])
      .select("id_debit");

    if (data_F2 && data_F2.id_debit) {
      // tính điểm F2 và lấy phần nguyên

      let total_scores_F2 = 0;
      if (data_register.new_regis == "NOACCOUNT") {
        total_scores_F2 = Math.floor(
          data_register.tuition_Fees * setting.score_F2
        );
      }

      // tính hoa hồng F2
      let total_rose_F2 = data_register.tuition_Fees * setting.rose_F2;

      // tổng điểm sau khi được cộng
      let wallet_after_F2 = data_F2.id_debit.wallet + total_scores_F2;

      // Check thăng hạng
      let check_addition_score_level_F2 = await setting.addition_score_level_wallet(
        data_F2.id_debit.level,
        wallet_after_F2
      );

      // nếu đủ điêm thì cộng, chỉ cộng 1 lần đầu
      if (check_addition_score_level_F2.addition) {
        wallet_after_F2 =
          wallet_after_F2 + check_addition_score_level_F2.score_addition;
      }

      // data update debit F2
      let updateDebit_F2 = {
        wallet: wallet_after_F2,
        money: data_F2.id_debit.money + total_rose_F2,
      };

      // check trên 500 điểm được đổi tiền
      if (wallet_after_F2 >= setting.on_Score) {
        updateDebit_F2 = {
          ...updateDebit_F2,
          check_money: true,
          level: check_addition_score_level_F2.level,
        };
      }

      // Cộng tiền và điểm F2
      let debit_F2 = await debit_model.findByIdAndUpdate(
        data_F2.id_debit._id,
        updateDebit_F2
      );

      // Lưu log tinh chi tiêu
      let data_paymentHistory_rose = await new paymentHistory_model({
        id_student: data_F2._id,
        type: "ROSE_MONEY",
        money: total_rose_F2,
        money_before: data_F2.id_debit.money,
        money_after: data_F2.id_debit.money + total_rose_F2,
      }).save();

      // Tổng chi
      // total_money_cost = total_money_cost + total_rose_F2;

      // Gửi noti cho user được cộng điểm và tiền hoa hồng F2
      let idUser = data_F2._id;
      let title =
        data_register.new_regis == "NOACCOUNT"
          ? "Cộng điểm và tiền hoa hồng"
          : "Tiền hoa hồng";
      let description =
        data_register.new_regis == "NOACCOUNT"
          ? `${data_register.id_student.name} vừa nộp tiền học. Bạn được cộng ${total_scores_F2} điểm và được cộng ${total_rose_F2} vnđ tiền hoa hồng`
          : `${data_register.id_student.name} vừa nộp tiền học. Bạn được cộng ${total_rose_F2} vnđ tiền hoa hồng`;
      let data = { ...{ data_register }, agent: "F2" };
      let type = "CLIENT";
      let type_noti =
        data_register.new_regis == "NOACCOUNT"
          ? "ROSE_AND_SCORE"
          : "ROSE_LEARN";
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
      if (check_addition_score_level_F2.addition) {
        let idUser = data_F2._id;
        let title = `Thăng hạng`;
        let description = `Chúc mừng bạn đã được thăng hạng ${check_addition_score_level_F2.title}. Bạn được cộng ${check_addition_score_level_F2.score_addition} điểm`;
        let data = { ...{ data_register }, agent: "F2" };
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
  }

  // lưu thống kê
  if (data_statistic) {
    let update_total_money = await statistic_model.findByIdAndUpdate(
      data_statistic._id,
      {
        total_money: total_money_statistics,
        // total_money_cost: total_money_cost,
      },
      { new: true }
    );
  }

  return true;
};

class Payment {
  async CreatePaypal(req, res) {
    try {
      let body = _extend({}, req.body);

      // Create register
      let check_data_register = await CheckDataRegister(req, res);
      if (!check_data_register) return;

      let name_items =
        check_data_register &&
        check_data_register.data_class &&
        check_data_register.data_class.id_Courses
          ? check_data_register.data_class.id_Courses.name
          : "";

      let sku_item =
        check_data_register && check_data_register.data_class
          ? check_data_register.data_class._id
          : "";

      // chuyên tiên vnđ -> usd hình như sai
      // const price_item =
      //   check_data_register && check_data_register.tuition_Fees_discount
      //     ? Math.ceil(check_data_register.tuition_Fees_discount * 0.0000424198)
      //     : "";

      // tính thêm thuế TIEN = TIEN + THUE
      // thue PayPal = 2.9%;
      let price_item =
        check_data_register && check_data_register.tuition_Fees_discount
          ? Math.ceil(check_data_register.tuition_Fees_discount / 23000)
          : "";
      // tính thue
      // price_item = Math.ceil(price_item + price_item * (2.9 / 100));

      let data_body = await new tableDraft_model({ data: body }).save();

      // data send paypal
      let create_payment_json = {
        intent: "sale",
        payer: {
          payment_method: "paypal",
        },
        redirect_urls: {
          return_url: `${paypal_return.return_url}/${price_item}?payment=PAYPAL&id_data_body=${data_body._id}`,
          cancel_url: paypal_return.cancel_url,
        },
        transactions: [
          {
            item_list: {
              items: [
                {
                  name: `Thanh toán khóa học ${name_items}`,
                  sku: sku_item.toString(),
                  price: price_item.toString(),
                  currency: "USD",
                  quantity: 1,
                },
              ],
            },
            amount: {
              currency: "USD",
              total: price_item.toString(),
            },
            description: "Thanh toán khóa học",
          },
        ],
      };

      await paypal.payment.create(
        create_payment_json,
        async (error, payment) => {
          if (error) {
            console.log("error", error);
            return responseError(res, 400, 82, error);
          }

          for (let item of payment.links) {
            if (item.rel === "approval_url") {
              return responseOk(res, item.href);
            }
          }
        }
      );
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  // check paypal success
  async PaypalSuccess(req, res) {
    try {
      let paymentId = req.query.paymentId;
      let payerID = req.query.PayerID;
      let price = req.params.price;

      let id_data_body = req.query.id_data_body;
      let data_body = await tableDraft_model
        .findById(id_data_body)
        .select("data");
      if (!data_body) return responseError(res, 400, 84, "PAYPAL_CREATE_WRONG");

      let body = await data_body.data;

      let execute_payment_json = {
        payer_id: payerID,
        transactions: [
          {
            amount: {
              currency: "USD",
              total: price.toString(),
            },
          },
        ],
      };

      await paypal.payment.execute(
        paymentId,
        execute_payment_json,
        async (error, payment) => {
          if (error) {
            console.log(error.response);

            // xoa data body nhap
            await tableDraft_model.findByIdAndDelete(id_data_body);

            return responseError(res, 400, 84, "PAYPAL_CREATE_WRONG");
          }
          let add_Register = await Create_Register(body, res);
          if (!add_Register) return;

          let id_register = add_Register._id;

          let update_status_regis = await UpdateStatusPayment(
            req,
            res,
            id_register
          );
          if (!update_status_regis) return;

          // Get lại list Student CMS
          await io.sockets
            .in("admin_TN")
            .emit("GET_LIST_STUDENT_REGISTER", "Get_List");

          // xoa data body nhap
          await tableDraft_model.findByIdAndDelete(id_data_body);

          let email = "";
          let date = "";
          if (body) {
            email = body.email;
            date = body.date;
          }

          // --- send mail dk success
          let data_class = await class_model
            .findById(add_Register.id_Class)
            .select("name");

          let data_regis = await registerLearn_model
            .findById(add_Register._id)
            .select("payment_date");

          if (data_class && data_regis) {
            let name_class = data_class.name;
            let money_class = add_Register.tuition_Fees_discount;

            let desc = `Lớp: ${name_class} - Học phí: ${money_class}vnđ - Thời gian: ${moment(
              data_regis.payment_date
            ).format("HH:mm-DD/MM/YYYY")}`;

            let url_backend = "http://localhost:9000";
            if (process.env.NODE_ENV == "production") {
              url_backend = "http://tringuyeneducation.xyz";
            }

            let hostName = ` ${url_backend}/client`;
            let account = `Tài khoản: ${email} - Mật khẩu: ${date}`;

            await transporter.verify((error, success) => {
              if (!error) {
                let html = teamplate_send_mailCourses(
                  desc,
                  hostName,
                  account,
                  email
                );
                transporter.sendMail(html, async (error, body) => {
                  if (error) {
                    console.log("error", error);
                  }
                });
              }
            });
          }
          // --- End send mail dk success

          return responseOk(res, { email, date });
          // return responseOk(res, "PAYMENT_SUCCESS");
        }
      );
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  // check paypal error
  async PaypalError(req, res) {
    try {
      console.log("ERROR_PAYPAL");
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  // -------  VN_PAY ------//
  async CreateVnpay(req, res) {
    try {
      let body = _extend({}, req.body);

      // Create register
      let check_data_register = await CheckDataRegister(req, res);
      if (!check_data_register) return;

      let name_courses =
        check_data_register &&
        check_data_register.data_class &&
        check_data_register.data_class.id_Courses
          ? nameFormat(check_data_register.data_class.id_Courses.name)
          : "";

      let amount =
        check_data_register && check_data_register.tuition_Fees_discount
          ? check_data_register.tuition_Fees_discount
          : 0;

      let ipAddr =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

      let data_body = await new tableDraft_model({ data: body }).save();

      let tmnCode = vn_pay.vnp_TmnCode;
      let secretKey = vn_pay.vnp_HashSecret;
      let vnpUrl = vn_pay.vnp_Url;
      let returnUrl = `${vn_pay.returnUrl}/${amount}?payment=VNPAY&id_data_body=${data_body._id}`;

      let date_now = new Date();
      let createDate = moment(date_now).format("YYYYMMDDHHmmss");
      let orderId = moment(date_now).format("HHmmss");

      let bankCode = body.bankCode;
      let orderInfo = `Thanh toan khoa hoc ${name_courses}`;
      let locale = body.language;
      if (locale === null || locale === "") {
        locale = "vn";
      }
      let currCode = "VND";
      let vnp_Params = {};
      vnp_Params["vnp_Version"] = "2";
      vnp_Params["vnp_Command"] = "pay";
      vnp_Params["vnp_TmnCode"] = tmnCode;
      // vnp_Params['vnp_Merchant'] = ''
      vnp_Params["vnp_Locale"] = "vn";
      vnp_Params["vnp_CurrCode"] = currCode;
      vnp_Params["vnp_TxnRef"] = date_now;
      vnp_Params["vnp_OrderInfo"] = orderInfo;
      vnp_Params["vnp_OrderType"] = "190000";
      vnp_Params["vnp_Amount"] = amount * 100;
      vnp_Params["vnp_ReturnUrl"] = returnUrl;
      vnp_Params["vnp_IpAddr"] = ipAddr; // "::1"; // ipAddr;
      vnp_Params["vnp_CreateDate"] = createDate;
      if (bankCode && bankCode !== null && bankCode !== "") {
        vnp_Params["vnp_BankCode"] = bankCode;
      }
      vnp_Params = sortObject(vnp_Params);

      let signData =
        secretKey + querystring.stringify(vnp_Params, { encode: false });

      let secureHash = sha256(signData);

      vnp_Params["vnp_SecureHashType"] = "SHA256";
      vnp_Params["vnp_SecureHash"] = secureHash;
      vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: true });

      return responseOk(res, vnpUrl);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async Vnpay_return(req, res) {
    let vnp_Params = req.query;
    let secureHash = vnp_Params["vnp_SecureHash"];
    let id_data_body = req.query.id_data_body;

    let data_body = await tableDraft_model
      .findById(id_data_body)
      .select("data");
    if (!data_body) return responseError(res, 400, 84, "PAYPAL_CREATE_WRONG");

    let body = await data_body.data;

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];
    //delete body
    delete vnp_Params["id_data_body"];
    delete vnp_Params["payment"];

    vnp_Params = sortObject(vnp_Params);

    let tmnCode = vn_pay.vnp_TmnCode;
    let secretKey = vn_pay.vnp_HashSecret;

    let signData =
      secretKey + querystring.stringify(vnp_Params, { encode: false });

    let checkSum = sha256(signData);

    if (secureHash === checkSum) {
      let add_Register = await Create_Register(body, res);
      if (!add_Register) return;

      let id_register = add_Register._id;

      let update_status_regis = await UpdateStatusPayment(
        req,
        res,
        id_register
      );
      if (!update_status_regis) return;

      // Get lại list Student CMS
      await io.sockets
        .in("admin_TN")
        .emit("GET_LIST_STUDENT_REGISTER", "Get_List");

      // xoa data body nhap
      await tableDraft_model.findByIdAndDelete(id_data_body);

      let email = "";
      let date = "";
      if (body) {
        email = body.email;
        date = body.date;
      }

      // --- send mail dk success
      let data_class = await class_model
        .findById(add_Register.id_Class)
        .select("name");

      let data_regis = await registerLearn_model
        .findById(add_Register._id)
        .select("payment_date");

      if (data_class && data_regis) {
        let name_class = data_class.name;
        let money_class = add_Register.tuition_Fees_discount;

        let desc = `Lớp: ${name_class} - Học phí: ${money_class}vnđ - Thời gian: ${moment(
          data_regis.payment_date
        ).format("HH:mm-DD/MM/YYYY")}`;

        let url_backend = "http://localhost:9000";
        if (process.env.NODE_ENV == "production") {
          url_backend = "http://tringuyeneducation.xyz";
        }

        let hostName = ` ${url_backend}/client`;
        let account = `Tài khoản: ${email} - Mật khẩu: ${date}`;

        await transporter.verify((error, success) => {
          if (!error) {
            let html = teamplate_send_mailCourses(
              desc,
              hostName,
              account,
              email
            );
            transporter.sendMail(html, async (error, body) => {
              if (error) {
                console.log("error", error);
              }
            });
          }
        });
      }
      // --- End send mail dk success

      return responseOk(res, { email, date });
    } else {
      // xoa data body nhap
      await tableDraft_model.findByIdAndDelete(id_data_body);

      return responseError(res, 400, 88, "INVALID_SIGNATURE");
    }
  }
  // ------- END VN_PAY ------//

  // ------ MoMo ------//
  async paymentMoMo(req, res) {
    try {
      let body = _extend({}, req.body);
      let orderId = uuidv4();
      let requestId = uuidv4();

      // Create register
      let check_data_register = await CheckDataRegister(req, res);
      if (!check_data_register) return;

      let name_courses =
        check_data_register &&
        check_data_register.data_class &&
        check_data_register.data_class.id_Courses
          ? nameFormat(check_data_register.data_class.id_Courses.name)
          : "";

      let amount =
        check_data_register && check_data_register.tuition_Fees_discount
          ? check_data_register.tuition_Fees_discount
          : 0;

      let data_body = await new tableDraft_model({ data: body }).save();

      let extraData = `id_dataBody=${data_body._id}`;

      // -- BUG nối nhiều  amount?payment=MOMO (hình như bug không phản hồi cho momo)
      returnUrl = returnUrl.split("/").slice(0, 4).join("/");
      // -- end BUG

      returnUrl = `${returnUrl}/${amount}?payment=MOMO`;
      orderInfo = `${orderInfo}`;
      amount = `${amount}`;
      let rawSignature =
        "partnerCode=" +
        partnerCode +
        "&accessKey=" +
        accessKey +
        "&requestId=" +
        requestId +
        "&amount=" +
        `${amount}` +
        "&orderId=" +
        orderId +
        "&orderInfo=" +
        orderInfo +
        "&returnUrl=" +
        returnUrl +
        "&notifyUrl=" +
        notifyurl +
        "&extraData=" +
        extraData;

      //signature
      let signature = crypto
        .createHmac("sha256", serectkey)
        .update(rawSignature)
        .digest("hex");

      //json object send to MoMo endpoint
      let send_momo = JSON.stringify({
        partnerCode: partnerCode,
        accessKey: accessKey,
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        returnUrl: returnUrl,
        notifyUrl: notifyurl,
        extraData: extraData,
        requestType: requestType,
        signature: signature,
      });

      //Create the HTTPS objects
      var options = {
        hostname: hostname_noHTTPS,
        port: 443,
        path: path,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(send_momo),
        },
      };

      //Send the request and get the response
      let req2 = https.request(options, (res2) => {
        res2.setEncoding("utf8");
        let data = "";

        res2.on("data", (dataResponse) => {
          data += dataResponse.toString();
        });

        res2.on("end", () => {
          data = JSON.parse(data);
          responseOk(res, data);
        });
      });

      req2.on("error", (e) => {
        console.log(`problem with request: ${e.message}`);
        responseError(res, 500, 0, e.message || "Error corrupt");
      });

      // write data to request body
      req2.write(send_momo);
      req2.end();
      return;
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async ipnCallbackMoMo(req, res) {
    try {
      let body = _extend({}, req.body);
      console.log("vào rôi: ipnCallbackMoMo");
    } catch (err) {
      console.log(err);
      // return responseError(res, 500, 0, "ERROR");
    }
  }

  async paymentCallbackMoMo(req, res) {
    try {
      let {
        partnerCode,
        accessKey,
        requestId,
        amount,
        orderId,
        orderInfo,
        orderType,
        transId,
        errorCode,
        responseTime,
        localMessage,
        message,
        payType,
        extraData,
        signature,
      } = req.query;

      let id_dataBody = extraData.split("=").slice(1).join("=");

      let data_body = await tableDraft_model
        .findById(id_dataBody)
        .select("data");
      if (!data_body) return responseError(res, 400, 84, "PAYPAL_CREATE_WRONG");

      let body = await data_body.data;

      let rawSignature =
        "partnerCode=" +
        partnerCode +
        "&accessKey=" +
        accessKey +
        "&requestId=" +
        requestId +
        "&amount=" +
        amount +
        "&orderId=" +
        orderId +
        "&orderInfo=" +
        orderInfo +
        "&orderType=" +
        orderType +
        "&transId=" +
        transId +
        "&message=" +
        message +
        "&localMessage=" +
        localMessage +
        "&responseTime=" +
        responseTime +
        "&errorCode=" +
        errorCode +
        "&payType=" +
        payType +
        "&extraData=" +
        extraData;

      //signature
      let signature_hex = crypto
        .createHmac("sha256", serectkey)
        .update(rawSignature)
        .digest("hex");

      if (errorCode != 0 || errorCode != "0") {
        // xoa data body nhap
        await tableDraft_model.findByIdAndDelete(id_dataBody);
        return responseError(res, 400, 88, "INVALID_SIGNATURE");
      }

      if (signature_hex == signature) {
        let add_Register = await Create_Register(body, res);
        if (!add_Register) return;

        let id_register = add_Register._id;

        let update_status_regis = await UpdateStatusPayment(
          req,
          res,
          id_register
        );
        if (!update_status_regis) return;

        // Get lại list Student CMS
        await io.sockets
          .in("admin_TN")
          .emit("GET_LIST_STUDENT_REGISTER", "Get_List");

        // xoa data body nhap
        await tableDraft_model.findByIdAndDelete(id_dataBody);

        let email = "";
        let date = "";
        if (body) {
          email = body.email;
          date = body.date;
        }

        // --- send mail dk success
        let data_class = await class_model
          .findById(add_Register.id_Class)
          .select("name");

        let data_regis = await registerLearn_model
          .findById(add_Register._id)
          .select("payment_date");

        if (data_class && data_regis) {
          let name_class = data_class.name;
          let money_class = add_Register.tuition_Fees_discount;

          let desc = `Lớp: ${name_class} - Học phí: ${money_class}vnđ - Thời gian: ${moment(
            data_regis.payment_date
          ).format("HH:mm-DD/MM/YYYY")}`;

          let url_backend = "http://localhost:9000";
          if (process.env.NODE_ENV == "production") {
            url_backend = "http://tringuyeneducation.xyz";
          }

          let hostName = ` ${url_backend}/client`;
          let account = `Tài khoản: ${email} - Mật khẩu: ${date}`;

          await transporter.verify((error, success) => {
            if (!error) {
              let html = teamplate_send_mailCourses(
                desc,
                hostName,
                account,
                email
              );
              transporter.sendMail(html, async (error, body) => {
                if (error) {
                  console.log("error", error);
                }
              });
            }
          });
        }
        // --- End send mail dk success

        return responseOk(res, { email, date });
      } else {
        // xoa data body nhap
        await tableDraft_model.findByIdAndDelete(id_dataBody);

        return responseError(res, 400, 88, "INVALID_SIGNATURE");
      }
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }
  // ------ End MoMo ------//
}

function sortObject(o) {
  let sorted = {},
    key,
    a = [];

  for (key in o) {
    if (o.hasOwnProperty(key)) {
      a.push(key);
    }
  }

  a.sort();

  for (key = 0; key < a.length; key++) {
    sorted[a[key]] = o[a[key]];
  }
  return sorted;
}
module.exports = Payment;
