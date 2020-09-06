const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ClassSchema = mongoose.Schema(
  {
    id_Courses: {
      type: Schema.Types.ObjectId,
      ref: "Courses",
      default: null
    },

    name: {
      type: String,
      default: ""
    },

    // thời gian : thư 2- thu 3
    time_day: {
      type: Array,
      default: []
    },

    //-- đào tạo 3 tháng (check)
    time_month: {
      type: String,
      default: ""
    },

    time_start: {
      type: String,
      default: ""
    },

    time_end: {
      type: String,
      default: ""
    },

    // tổng số buổi học
    total_lesson: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["OPEN", "STUDYING", "CLOSE"],
      default: "OPEN"
    },

    id_teacher: {
      type: Schema.Types.ObjectId,
      ref: "admin",
      default: null
    },

    // thời khóa biểu
    // check có nên lưu vậy không hay bảng riêng
    // schedule: {
    //   id_teacher: {
    //     type: Schema.Types.ObjectId,
    //     ref: "admin",
    //     default: null
    //   },

    //   // h bắt đầu
    //   time_start: {
    //     type: String,
    //     default: ""
    //   },

    //   // h kết thúc
    //   time_end: {
    //     type: String,
    //     default: ""
    //   }
    // },

    // mo ta
    depict: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.id;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model("Class", ClassSchema);
