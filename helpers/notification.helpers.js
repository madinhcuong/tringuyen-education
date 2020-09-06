const notification = require("../models/notification.model");

module.exports = {
  //Create notification
  createNotification: async function (
    idUser,
    title,
    description,
    data,
    type,
    type_noti
  ) {
    const result = await new notification({
      user_id: idUser, // Thông báo của user nào.
      title: title, //Tiêu đề ngắn
      description: description, // Mô tả ngắn
      type: type, // Loại thông báo
      type_noti: type_noti, // key thông báo
      data: data, // Object
    }).save();

    if (result) return result;
  },

  createNotification_score_transfer: async function (
    idUser,
    title,
    description,
    data,
    type,
    type_noti,
    score_transfer
  ) {
    const result = await new notification({
      user_id: idUser, // Thông báo của user nào.
      title: title, //Tiêu đề ngắn
      description: description, // Mô tả ngắn
      type: type, // Loại thông báo
      type_noti: type_noti, // key thông báo
      data: data, // Object,
      score_transfer,
    }).save();

    if (result) return result;
  },
};
