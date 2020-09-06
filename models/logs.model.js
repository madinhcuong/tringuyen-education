const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LogsSchema = mongoose.Schema(
  {
    id_user: {
      type: Schema.Types.ObjectId,
      ref: "admin",
      default: null
    },

    data_user: {
      type: Object,
      default: ""
    },

    action: {
      require: true,
      type: String,
      enum: ["LOGIN", "CREATE", "UPDATE", "DELETE", "IMPOPRT", "EXPORT", "SEND_NOTI","EXPORT_INVOICE", null]
    },

    content: {
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

module.exports = mongoose.model("Logs", LogsSchema);
