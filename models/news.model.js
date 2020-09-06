const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NewsSchema = mongoose.Schema(
  {
    id_topic: {
      //  type: String
      type: Schema.Types.ObjectId,
      ref: "Topic",
      default: null,
    },

    image: {
      type: String,
      default: "",
    },

    name_news: {
      type: String,
      default: "",
    },

    content: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("News", NewsSchema);
