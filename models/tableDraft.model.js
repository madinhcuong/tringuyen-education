const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TableDraftSchema = mongoose.Schema(
  {
    data: {
      type: Object,
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

module.exports = mongoose.model("TableDraft", TableDraftSchema);
