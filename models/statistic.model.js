const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StatisticSchema = mongoose.Schema(
  {
    total_money: {
      type: Number,
      default: 0
    },

    total_money_cost: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model("Statistic", StatisticSchema);
