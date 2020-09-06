const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CourseSchema = mongoose.Schema(
  {
    id_training: {
      type: Schema.Types.ObjectId,
      ref: "Training",
      default: null
    },

    name: {
      type: String,
      default: ""
    },

    time: {
      type: String,
      default: ""
    },

    tuition_Fees: {
      type: Number,
      default: 0
    },

    location: {
      type: String,
      default: ""
    },

    depict: {
      // mo ta
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["OPEN", "CLOSE"],
      default: "OPEN"
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

CourseSchema.virtual("class", {
  ref: "Class",
  localField: "_id",
  foreignField: "id_Courses",
  justOne: true
});

module.exports = mongoose.model("Courses", CourseSchema);
