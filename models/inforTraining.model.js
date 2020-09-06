const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const InforTrainingSchema = mongoose.Schema(
  {
    id_training: {
      type: Schema.Types.ObjectId,
      ref: "Training",
      default: null
    },

    image: {
      type: String,
      default: ""
    },

    name: {
      type: String,
      default: ""
    },

    introduction: {
      type: String,
      default: ""
    },

    proviso: {
      // điều kiện
      type: String,
      default: ""
    },

    target: {
      // mục tiêu
      type: String,
      default: ""
    },

    product: {
      type: String,
      default: ""
    },

    certification: {
      // chứng nhận
      type: String,
      default: ""
    },

    schedule: {
      type: String,
      default: ""
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

module.exports = mongoose.model("InforTraining", InforTrainingSchema);
