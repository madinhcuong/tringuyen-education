const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FileUploadSchema = mongoose.Schema(
  {
    path_name: {
      type: String,
      default: "",
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

module.exports = mongoose.model("FileUpload", FileUploadSchema);
