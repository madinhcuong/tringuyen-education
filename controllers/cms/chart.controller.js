const { responseOk, responseError } = require("../../helpers/_base_helpers");
const moment = require("moment");
const ExcelJS = require("exceljs");

const register_model = require("../../models/registeredLearn.model");
const statistic_model = require("../../models/statistic.model");
const course_model = require("../../models/courses.model");
const class_model = require("../../models/class.model");
const student_model = require("../../models/student.model");
const paymentHistory_model = require("../../models/paymentHistory.model");
const pay_model = require("../../models/pay.model");

StatisticsByDate = async (timeStart, timeEnd, total_seach) => {
  let data_total = [];
  let total_money = 0;
  if (timeStart && timeEnd && total_seach) {
    // tìm kiếm theo doanh thu
    if (total_seach == "REVENUE") {
      // let startYear = new Date(year, 0, 1, 17, 0, 0, 0).toISOString();

      data_total = await register_model
        .find({
          payment_status: "APPROVED",
          payment_date: {
            $gte: new Date(`${timeStart}T00:00:00`),
            $lt: new Date(`${timeEnd}T23:59:59`),
          },
        })
        .populate([
          {
            path: "id_student",
            match: { check_learn: true, type: "STUDENT" },
            select: "name date sex phone email",
          },
        ])
        .populate([
          {
            path: "id_Class",
            select: "name",
          },
        ])
        .select(
          "tuition_Fees_discount id_student id_Class sale_percent tuition_Fees createdAt payment_date"
        )
        .sort({ payment_date: -1 });

      if (data_total.length > 0) {
        for (let item of data_total) {
          total_money += item.tuition_Fees_discount;
        }
      }
    }

    // tìm kiếm theo cộng điêm
    if (total_seach == "SUM_SCORE") {
      data_total = await paymentHistory_model
        .find({
          type: "ROSE_MONEY",
          // $or: [{ type: "ROSE_MONEY" }, { type: "PAY_MONEY" }],
          createdAt: {
            $gte: new Date(`${timeStart}T00:00:00`),
            $lt: new Date(`${timeEnd}T23:59:59`),
          },
        })
        .populate([
          {
            path: "id_student",
            match: { check_learn: true, type: "STUDENT" },
            select: "name date sex phone email",
          },
        ])
        .select("id_student money type createdAt")
        .sort({ createdAt: -1 });

      if (data_total) {
        for (let item of data_total) {
          total_money += item.money;
        }
      }
    }

    // tìm kiếm theo chi Tiêu
    if (total_seach == "COST") {
      data_total = await pay_model
        .find({
          status: "APPROVED",
          updatedAt: {
            $gte: new Date(`${timeStart}T00:00:00`),
            $lt: new Date(`${timeEnd}T23:59:59`),
          },
        })
        .populate([
          {
            path: "id_student",
            match: { check_learn: true, type: "STUDENT" },
            select: "name date sex phone email",
          },
        ])
        .select("id_student money status updatedAt")
        .sort({ updatedAt: -1 });

      if (data_total.length > 0) {
        for (let item of data_total) {
          total_money += item.money;
        }
      }
    }
  }

  let data = { total_money, data_total };
  return data;
};

class Chart {
  async GetChartByYear(req, res) {
    try {
      let year = req.params.id;
      if (year === undefined || year === null || year === "") {
        year = moment().format("YYYY");
      }

      // múi h mk +7 là 17+7 =24
      // const startYear = new Date(year, 0, 1, 17, 0, 0, 0).toISOString();
      // const endYear = new Date(year, 12, 0, 17, 0, 0, 0).toISOString();

      const startYear = new Date(year, 0, 1, 0, 0, 0, 0).toISOString();
      const endYear = new Date(year, 12, 31, 0, 0, 0, 0).toISOString();

      // new Date(startYear): chuyển về h đề query
      let data_total = await register_model
        .find({
          payment_status: "APPROVED",
          createdAt: { $gte: new Date(startYear), $lt: new Date(endYear) },
        })
        .select("tuition_Fees_discount createdAt");

      // tổng chi tiêu
      // let paymentHistory_total = await paymentHistory_model
      //   .find({
      //     type: "ROSE_MONEY",
      //     // $or: [{ type: "ROSE_MONEY" }, { type: "PAY_MONEY" }],
      //     createdAt: { $gte: new Date(startYear), $lt: new Date(endYear) },
      //   })
      //   .select("money createdAt");

      // tinh tong chi tieu theo thanh toan tiền (ko lam theo cộng tiền nưa)
      let data_pay = await pay_model
        .find({
          status: "APPROVED",
          updatedAt: { $gte: new Date(startYear), $lt: new Date(endYear) },
        })
        .select("money updatedAt");

      let total_money = 0;
      let total_money_cost = 0;
      let data_statistic = await statistic_model
        .findOne({})
        .select("total_money total_money_cost");
      if (data_statistic) {
        total_money = data_statistic.total_money;
        total_money_cost = data_statistic.total_money_cost;
      }

      // Tổng doanh thu
      let yearTotals = 0;
      let monthTotals = [];
      if (data_total) {
        for (let item of data_total) {
          yearTotals += item.tuition_Fees_discount;
        }
      }

      // doanh thu từng tháng
      for (let month = 1; month <= 12; month++) {
        let monthTotal = 0;
        if (data_total) {
          for (let item of data_total) {
            if (month == item.createdAt.getMonth() + 1) {
              monthTotal += item.tuition_Fees_discount;
            }
          }
        }
        monthTotals.push(monthTotal);
      }

      // Tổng chi tiêu
      let yearTotals_cost = 0;
      let monthTotals_cost = [];
      if (data_pay.length > 0) {
        for (let item of data_pay) {
          yearTotals_cost += item.money;
        }
      }

      // tổng chi tiêu theo tháng
      for (let month = 1; month <= 12; month++) {
        let monthTotal_cost = 0;
        if (data_pay.length > 0) {
          for (let item of data_pay) {
            if (month == item.updatedAt.getMonth() + 1) {
              monthTotal_cost += item.money;
            }
          }
        }
        monthTotals_cost.push(monthTotal_cost);
      }

      let data = {
        total_money_revenue: {
          total_money,
          yearTotals,
          monthTotals,
        },
        total_money_cost: {
          total_money_cost,
          yearTotals_cost,
          monthTotals_cost,
        },
      };

      return responseOk(res, data);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async GetChartByMonth(req, res) {
    try {
      let date = req.query.date;

      let month = date.split("/").slice(0, 1).join("/");
      let year = date.split("/").slice(1, 2).join("/");
      month = +month - 1;
      year = +year;

      let timeStart = new Date(year, month, 1, 0, 0, 0, 0).toISOString();
      let timeEnd = new Date(year, month, 31, 0, 0, 0, 0).toISOString();

      // tổng doanh thu
      let data_total = await register_model
        .find({
          payment_status: "APPROVED",
          createdAt: { $gte: new Date(timeStart), $lt: new Date(timeEnd) },
        })
        .select("tuition_Fees_discount createdAt");

      // tổng chi tiêu
      // let paymentHistory_total = await paymentHistory_model
      //   .find({
      //     type: "ROSE_MONEY",
      //     // $or: [{ type: "ROSE_MONEY" }, { type: "PAY_MONEY" }],
      //     createdAt: { $gte: new Date(timeStart), $lt: new Date(timeEnd) },
      //   })
      //   .select("money createdAt");

      // tinh tong chi tieu theo thanh toan tiền (ko lam theo cộng tiền nưa)
      let data_pay = await pay_model
        .find({
          status: "APPROVED",
          updatedAt: { $gte: new Date(timeStart), $lt: new Date(timeEnd) },
        })
        .select("money updatedAt");

      // tổng doanh thu
      let monthTotals = 0;
      monthTotals = data_total
        .map((item) => item.tuition_Fees_discount)
        .reduce((prev, curr) => prev + curr, 0);

      // Tổng chi tiêu
      let monthTotals_cost = 0;
      monthTotals_cost = data_pay
        .map((item) => item.money)
        .reduce((prev, curr) => prev + curr, 0);

      let dayOfMonth = moment(`${year}-${month + 1}`, "YYYY-MM").daysInMonth();

      // doanh thu theo tháng
      let monthTotalByDay = [];
      for (let day = 1; day <= +dayOfMonth; day++) {
        let dayTotal = 0;
        if (data_total) {
          for (let item of data_total) {
            if (day == item.createdAt.getDate()) {
              dayTotal += item.tuition_Fees_discount;
            }
          }
        }
        monthTotalByDay.push(dayTotal);
      }

      // tổng chi tiêu theo tháng
      let monthTotalByDay_cost = [];
      for (let day = 1; day <= +dayOfMonth; day++) {
        let dayTotal = 0;
        if (data_pay.length > 0) {
          for (let item of data_pay) {
            if (day == item.updatedAt.getDate()) {
              dayTotal += item.money;
            }
          }
        }
        monthTotalByDay_cost.push(dayTotal);
      }

      let data = {
        total_money_revenue: {
          monthTotals,
          monthTotalByDay,
        },
        total_money_cost: {
          monthTotals_cost,
          monthTotalByDay_cost,
        },
      };

      return responseOk(res, data);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async GetTotalStatistics(req, res) {
    try {
      let total_course = await course_model.find().countDocuments();
      if (!total_course) total_course = 0;

      let total_class = await class_model.find().countDocuments();
      if (!total_class) total_class = 0;

      let total_student = await student_model
        .find({ check_learn: true })
        .countDocuments();
      if (!total_student) total_student = 0;

      let total_register = await student_model.find().countDocuments();
      if (!total_register) total_register = 0;

      let data = {
        total_course,
        total_class,
        total_student,
        total_register,
      };

      return responseOk(res, data);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  async GetStatisticsByDate(req, res) {
    try {
      let timeStart = req.query.timeStart;
      let timeEnd = req.query.timeEnd;
      let total_seach = req.query.total_seach;

      let data = await StatisticsByDate(timeStart, timeEnd, total_seach);

      return responseOk(res, data);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, 0, "ERROR");
    }
  }

  // xuat excel theo tìm kiếm
  async exportExcelStatisticsByDate(req, res) {
    let timeStart = req.query.timeStart;
    let timeEnd = req.query.timeEnd;
    let total_seach = req.query.total_seach;

    let data = await StatisticsByDate(timeStart, timeEnd, total_seach);

    let data_total = [];
    if (data.data_total.length > 0) {
      let stt = 1;
      for (let item of data.data_total) {
        let date_pay = "";
        if (total_seach == "REVENUE") {
          date_pay = item.payment_date;
        }
        if (total_seach == "SUM_SCORE") {
          date_pay = item.createdAt;
        }
        if (total_seach == "COST") {
          date_pay = item.updatedAt;
        }
        let obj = {
          stt: `${stt++}`,
          name: item.id_student.name,
          sex: item.id_student.sex == "MALE" ? "Nam" : "Nữ",
          date: item.id_student.date,
          email: item.id_student.email,
          phone: item.id_student.phone,
          type: total_seach == "SUM_SCORE" ? "Hoa hồng" : "Thanh toán",
          money: `${item.money ? item.money : item.tuition_Fees_discount}`,
          name_class: item.id_Class ? item.id_Class.name : "",
          sale_percent: `${item.sale_percent}`,
          payment_date: moment(date_pay).format("HH:mm-DD/MM/YYYY"),
        };
        data_total.push(obj);
      }
    }

    let workbook = new ExcelJS.Workbook(); //creating workbook
    let title_worksheet = "doanh thu";
    if (total_seach == "COST") {
      title_worksheet = "chi tiêu";
    }
    if (total_seach == "SUM_SCORE") {
      title_worksheet = "hoa hồng";
    }
    let worksheet = workbook.addWorksheet(`Thống kê ${title_worksheet}`); //creating worksheet

    let font = {
      size: 12,
      bold: true,
      name: "Times New Roman",
    };

    let title_header = "DOANH THU";
    if (total_seach == "COST") {
      title_header = "CHI TIÊU";
    }
    if (total_seach == "SUM_SCORE") {
      title_header = "HOA HỒNG";
    }
    worksheet.getCell(`A1`).value = `THỐNG KÊ ${title_header}`;
    worksheet.mergeCells("A1:E1");
    worksheet.getCell(`A1`).font = font;

    timeStart = moment(new Date(timeStart)).format("DD/MM/YYYY");
    timeEnd = moment(new Date(timeEnd)).format("DD/MM/YYYY");

    worksheet.getCell(`A3`).value = `THỜI GIAN: ${timeStart} - ${timeEnd}`;
    worksheet.mergeCells("A3:E3");
    worksheet.getCell(`A3`).font = font;

    worksheet.getCell(`A4`).value = `TỔNG TIỀN: ${data.total_money} vnđ`;
    worksheet.mergeCells("A4:E4");
    worksheet.getCell(`A4`).font = font;

    //  WorkSheet Header
    worksheet.getRow(6).values = [
      "STT",
      "HỌ VÀ TÊN",
      "NGÀY SINH",
      "GIỚI TÍNH",
      "EMAIL",
      "SĐT",
      "GIẢM GIÁ (%)",
      "SỐ TIỀN (vnđ)",
      "NGÀY THANH TOÁN",
    ];
    if (total_seach == "COST" || total_seach == "SUM_SCORE") {
      worksheet.getRow(6).values = [
        "STT",
        "HỌ VÀ TÊN",
        "NGÀY SINH",
        "GIỚI TÍNH",
        "EMAIL",
        "SĐT",
        "TYPE",
        "SỐ TIỀN (vnđ)",
      ];
    }

    worksheet.columns = [
      { key: "stt", width: 7 },
      { key: "name", width: 30 },
      { key: "date", width: 15 },
      { key: "sex", width: 15 },
      { key: "email", width: 30 },
      { key: "phone", width: 20 },
      total_seach == "COST" || total_seach == "SUM_SCORE"
        ? { key: "type", width: 20 }
        : { key: "sale_percent", width: 20 },
      { key: "money", width: 20 },
      { key: "payment_date", width: 20 },
    ];
    worksheet.getRow(6).font = {
      size: 10,
      bold: true,
      name: "Times New Roman",
    };

    // xuất excel
    worksheet.addRows(data_total);
    res.attachment("ThongKeTriNguyen.xlsx");
    workbook.xlsx
      .write(res)
      .then(() => {
        res.end();
      })
      .catch((err) => {
        console.log(err);
        return responseError(res, 500, 0, "ERROR");
      });
  }
}

module.exports = Chart;
