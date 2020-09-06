const statistic_model = require("../models/statistic.model");

let data = {
  total_money: 0,
  total_money_cost: 0,
};

statistic_model.countDocuments(async (err, cnt) => {
  if (cnt < 1) {
    await new statistic_model(data).save();
  }
});
