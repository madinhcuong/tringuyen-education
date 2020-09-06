const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// yêu cầu thanh toán tiền

const PaySchema = mongoose.Schema(
  {
    id_student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },

    // số tiền yêu cầu
    money: {
      type: Number,
      default: 0,
    },

    description:{
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret, options) => {
        delete ret.id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("Pay", PaySchema);
