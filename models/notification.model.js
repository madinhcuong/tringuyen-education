const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationSchema = new mongoose.Schema(
  {
    // id client, admin null
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },

    // tiêu đề
    title: {
      type: String,
      default: "",
    },

    // mo ta
    description: {
      type: String,
      default: "",
    },

    // Admin or Client
    type: {
      type: String,
      enum: ["ADMIN", "CLIENT"],
      default: "CLIENT",
    },

    type_noti: {
      type: String,
      enum: [
        "MONEY_LEARN",
        "ROSE_AND_SCORE",
        "ROSE_LEARN",
        "ROSE",
        "SCORE",
        "CLASS",
        "ADDITION_SCORE_LEVEL",
        "PAY_STUDENT",
        "SCORE_SEND",
        "SCORE_BORROW",
        "VERI_TRANSFER_SCORE"
      ],
      default: "",
      // MONEY_LEARN: nộp tiền học noti cho mình
      // ROSE_AND_SCORE: cộng điểm và cộng tiền ở nộp tiền học F1, F2
      // ROSE_LEARN: nộp tiền học khi đã có tk F1, F2
      // ROSE: tiền hoa hồng đổi điểm noti cho F1, F2
      // SCORE: mình đổi điểm noti cho CMS
      // CLASS:  thông báo cả lớp học or từng học viên,
      // PAY_STUDENT: yêu cầu thanh toán tiền
      // SCORE_SEND: Gửi điểm cho người bạn nhập mã giới thiệu (cho điểm)
      // SCORE_BORROW: Gửi yêu cầu xin điểm cho người nhập mã giới thiệu (Xin điểm)
      // VERI_TRANSFER_SCORE: noti xác nhận, từ chối chuyển tiền
    },

    data: {
      type: Object,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "APPROVE"],
      default: "INACTIVE",
    },

    // check click notification
    check_Click_Noti: {
      type: Boolean,
      default: false,
    },

    // trạng thai chuyển điểm học viên
    status_score_transfer: {
      type: String,
      enum: ["PENDING", "REJECT", "APPROVE"],
      default: "PENDING",
    },

    // số điểm khi yêu cầu cho điểm or xin điểm
    score_transfer: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret, options) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

NotificationSchema.virtual("id_Class", {
  ref: "Class",
  localField: "data.id_Class",
  foreignField: "_id",
  justOne: true,
});

NotificationSchema.virtual("id_student", {
  ref: "Student",
  localField: "data.data_register.id_student",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.model("Notification", NotificationSchema);
