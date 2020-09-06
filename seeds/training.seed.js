const Training_model = require("../models/training.model");

let data_training = [
  {
    name: "Thiết kế website"
  },
  {
    name: "Mạng máy tính"
  },
  {
    name: "Kiểm thử phần mềm"
  },
  {
    name: "Lập trình di động"
  },
  {
    name: "Internet Marketing"
  },
  {
    name: "Tin học văn phòng"
  },
  {
    name: "Lập tình và CSDL"
  },
  {
    name: "Đồ họa cho trẻ em"
  }
];

Training_model.countDocuments(async (err, cnt) => {
  if (cnt < 1) {
    for (let item of data_training) {
      await new Training_model(item).save();
    }
  }
});
