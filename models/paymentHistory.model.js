const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentHistorySchema = mongoose.Schema(
  {
    id_student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },

    type: {
      type: String,
      enum: [
        "ROSE_MONEY",
        "SCORE_CODE",
        "SCORE_MONEY",
        "PAY_MONEY",
        "SCORE_SEND",
        "SCORE_BORROW",
      ],
      default: "",
      // ROSE_MONEY: tiền hoa hồng
      // SCORE_CODE: đổi điểm thành mã giảm
      // SCORE_MONEY: đổi điểm thành tiền
      // PAY_MONEY: Thanh toán tiền khi student yêu cầu
      // SCORE_SEND: Gửi điểm cho người bạn nhập mã giới thiệu (cho điểm)
      // SCORE_BORROW: Gửi yêu cầu xin điểm cho người nhập mã giới thiệu (Xin điểm)
    },

    // số điểm khi yêu cầu cho điểm or xin điểm
    score_transfer:{
      type: Number,
      default: 0,
    },

    // số tiền được cộng or tiền yêu cầu thanh toán
    money: {
      type: Number,
      default: 0,
    },

    // số tiền trước khi cộng
    money_before: {
      type: Number,
      default: 0,
    },

    // số tiền sau khi cộng
    money_after: {
      type: Number,
      default: 0,
    },

    // số điểm đổi
    change_score: {
      type: Number,
      default: 0,
    },

    // số điểm trước khi đổi
    change_score_before: {
      type: Number,
      default: 0,
    },

    // số điểm sua khi đổi
    change_score_after: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.id;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("PaymentHistory", PaymentHistorySchema);
