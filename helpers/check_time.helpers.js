const moment = require("moment");

module.exports = {
  check_time: (
    time_start_one,
    time_end_one,
    th_one,
    hour1,
    hour2,
    time_start_two,
    time_end_two,
    th_two,
    hour3,
    time4
  ) => {
    let one_hour_start = moment.utc(hour1, "HH:mm").format("x");
    let one_hour_end = moment.utc(hour2, "HH:mm").format("x");

    let two_hour_start = moment.utc(hour3, "HH:mm").format("x");
    let two_hour_end = moment.utc(time4, "HH:mm").format("x");

    let time_start_one_format = new Date(
      moment(time_start_one, "DD/MM/YYYY").format("MM/DD/YYYY")
    ).setHours(0, 0, 0, 0);

    let time_end_one_format = new Date(
      moment(time_end_one, "DD/MM/YYYY").format("MM/DD/YYYY")
    ).setHours(0, 0, 0, 0);

    let time_start_tow_format = new Date(
      moment(time_start_two, "DD/MM/YYYY").format("MM/DD/YYYY")
    ).setHours(0, 0, 0, 0);

    let time_end_tow_format = new Date(
      moment(time_end_two, "DD/MM/YYYY").format("MM/DD/YYYY")
    ).setHours(0, 0, 0, 0);

    if (
      time_start_one_format == time_start_tow_format ||
      time_start_one_format == time_end_tow_format ||
      time_end_one_format == time_start_tow_format ||
      time_end_one_format == time_end_tow_format ||
      (time_start_tow_format <= time_start_one_format &&
        time_start_one_format <= time_end_tow_format) ||
      (time_start_tow_format <= time_end_one_format &&
        time_end_one_format <= time_end_tow_format) ||
      (time_start_one_format <= time_start_tow_format &&
        time_start_tow_format <= time_end_one_format) ||
      (time_start_one_format <= time_end_tow_format &&
        time_end_tow_format <= time_end_one_format)
    ) {
      if (
        (two_hour_start < one_hour_start &&
          one_hour_start < two_hour_end &&
          th_one == th_two) ||
        (two_hour_start < one_hour_end &&
          one_hour_end < two_hour_end &&
          th_one == th_two) ||
        (one_hour_start < two_hour_start &&
          two_hour_start < one_hour_end &&
          th_one == th_two) ||
        (one_hour_start < two_hour_end &&
          two_hour_end < one_hour_end &&
          th_one == th_two)
      ) {
        return false; // trung
      } else {
        return true;
      }
    } else {
      return true;
    }
  },

  check_time_discount: time_discount => {
    let date_new = moment().format("MM/DD/YYYY");
    let setHours_date_now = new Date(date_new).setHours(0, 0, 0, 0);

    let expiry_date = moment(time_discount).format("MM/DD/YYYY");
    let setHours_expiry_date = new Date(expiry_date).setHours(0, 0, 0, 0);
    if (setHours_date_now <= setHours_expiry_date) {
      return true;
    }
    return false;
  }
};
