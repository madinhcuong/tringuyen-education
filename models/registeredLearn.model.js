const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RegisteredLearnSchema = mongoose.Schema(
  {
    // mã chung chi
    diploma_code: {
      type: String,
      default: "",
    },

    id_Class: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      default: null,
    },

    id_student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },

    payment_status: {
      type: String,
      enum: ["PENDING", "APPROVED"],
      default: "PENDING",
    },

    // ngày nộp tiền
    payment_date: {
      type: Date,
      default: "",
    },

    // giảm giá bao nhiêu %
    sale_percent: {
      type: Number,
      default: 0,
    },

    // tiền khóa học
    tuition_Fees: {
      type: Number,
      default: 0,
    },

    // tiền có discount
    tuition_Fees_discount: {
      type: Number,
      default: 0,
    },

    // điểm học
    score_30: {
      type: Number,
      default: 0,
    },

    score_70: {
      type: Number,
      default: 0,
    },

    total_score: {
      type: Number,
      default: 0,
    },

    // đăng ký mới or đã có account
    new_regis: {
      type: String,
      enum: ["ACCOUNT", "NOACCOUNT"],
      default: "NOACCOUNT",
    },

    // check xuất hóa đơn chỉ xuất 1 lần
    check_invoice: {
      type: String,
      enum: ["NOT_EXPORT", "EXPORT"],
      default: "NOT_EXPORT",
    },

    // phương thức thanh toán
    payment_method: {
      type: String,
      enum: ["LOCAL", "PAYPAL", "VNPAY", "MOMO"],
      default: "LOCAL",
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

module.exports = mongoose.model("RegisteredLearn", RegisteredLearnSchema);
