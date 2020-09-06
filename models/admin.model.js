const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminSchema = new mongoose.Schema(
  {
    avatar: {
      type: String,
      default: ""
    },

    fullName: {
      type: String,
      default: ""
    },

    date: {
      type: String,
      default: ""
    },

    phone: {
      type: String,
      default: ""
    },

    sex: {
      type: String,
      enum: ["MALE", "FEMALE"],
      default: ""
    },

    depict: {
      // miêu tả
      type: String,
      default: ""
    },

    address: {
      type: String,
      default: ""
    },

    specialize: {
      type: Schema.Types.ObjectId,
      ref: "Training",
      default: null
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    permissionGroup: {
      type: Schema.Types.ObjectId,
      ref: "adminrole"
    },

    type: {
      type: String,
      enum: ["ADMIN", "STAFF", "TEACHER"],
      default: ""
    },

    status: {
      type: String,
      enum: ["ACTIVATE", "INACTIVE"],
      default: "ACTIVATE"
    },

    // reset password
    resetPassword: {
      expires: {
        type: Number,
        default: ""
      },

      key: {
        type: String,
        default: ""
      }
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret, options) => {
        delete ret.__v;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model("admin", AdminSchema);
