const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudentSchema = mongoose.Schema(
  {
    // mã đại lý cua minh (ma code cua nta)
    agent_code: {
      type: String,
      default: "",
    },

    // ma của mình (ma code cua ban)
    your_agent: {
      type: String,
      default: "",
    },

    id_debit: {
      type: Schema.Types.ObjectId,
      ref: "Debit",
      default: null,
    },

    name: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    date: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    sex: {
      type: String,
      enum: ["MALE", "FEMALE"],
      default: "MALE",
    },

    address: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      unique: true,
      default: "",
    },

    password: {
      type: String,
      default: "",
    },

    // check xem đã nộp tiền và học chưa. (có cho login vs danh sách học viên)
    check_learn: {
      type: Boolean,
      default: false,
    },

    //Danh sách con của đại lý(ĐL)
    list_child_agent: [
      {
        id: String,
        _id: false,
      },
    ],

    type: {
      type: String,
      enum: ["PRESENTER", "STUDENT"],
      default: "STUDENT",
    },

    // reset password
    resetPassword: {
      expires: {
        type: Number,
        default: "",
      },

      key: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret, options) => {
        delete ret.password;
        delete ret.id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("Student", StudentSchema);
