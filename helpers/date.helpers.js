const moment = require("moment");

module.exports = {
  subtract_Date: (time_start, time_end) => {
    let time_start_format = moment(time_start, "YYYY-MM-DD");
    let time_end_format = moment(time_end, "YYYY-MM-DD");
    let momentString_start = time_start_format.format("YYYY, MM, DD");
    let momentString_end = time_end_format.format("YYYY, MM, DD");

    let date1 = new Date(momentString_start); // "18/03/2015", month is 0-index
    let date2 = new Date(momentString_end); // "20/03/2015"

    let msDiff = date2 - date1; // this is time in milliseconds
    let daysDiff = msDiff / 1000 / 60 / 60 / 24; // days
    return daysDiff;
  }
};
