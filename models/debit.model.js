const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DebitSchema = mongoose.Schema(
  {
    id_user: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },

    // tổng điểm
    wallet: {
      type: Number,
      default: 0,
    },

    // tiền-quy đổi
    money: {
      type: Number,
      default: 0,
    },

    // trên 500 cho đổi tiên
    check_money: {
      type: Boolean,
      default: false,
    },

    discount: [
      {
        discount_code: {
          type: String,
          default: "",
        },

        sale: {
          type: Number,
          default: 0,
        },

        // ngày hết hạn
        expiry_date: {
          type: Date,
          default: new Date(),
        },

        _id: false,
      },
    ],

    level: {
      // Hạng hội viên
      type: String,
      enum: ["bronze", "silver", "gold", "diamond"],
      default: "bronze",
      // Hạng hội viên:
      // 0 - 499: Đồng
      // 500 điểm: Bạc
      // 1000 điểm: Vàng
      // 10000 điểm: Kim Cương
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

module.exports = mongoose.model("Debit", DebitSchema);
