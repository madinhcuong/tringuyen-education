const _ = require("lodash");
const bcrypt = require("bcrypt");
const { _extend } = require("util");

const Admin = require("../models/admin.model");
const AdminRole = require("../models/adminrole.model");

const admin = [
  {
    fullName: "admin",
    email: "admin@gmail.com",
    phone: "0987654321",
    password: bcrypt.hashSync("admin123", 10),
    avatar: "",
    permissionGroup: "",
    specialize: null,
    date: "01/01/2019",
    sex: "MALE",
    address: "Hồ Chí Minh",
    type: "ADMIN",
    status: "ACTIVATE",
    //  permissionAdmin: []
  },
];

const roleDefault = {
  no_change: true,
  key_role: "master",
  name: "Toàn quyền",
  description: "toàn quyền",
  permissions: [
    //-- Role
    "READ_ADMINROLE",
    "CREATE_ADMINROLE",
    "UPDATE_ADMINROLE",

    //-- Staff
    "READ_ADMIN",
    "CREATE_ADMIN",
    "UPDATE_ADMIN",

    //-- Teacher
    "READ_TEACHER",
    "CREATE_TEACHER",
    "UPDATE_TEACHER",

    //-- Topic
    "READ_TOPIC",
    "CREATE_TOPIC",
    "UPDATE_TOPIC",
    "DELETE_TOPIC",

    //-- News
    "READ_NEWS",
    "CREATE_NEWS",
    "UPDATE_NEWS",
    "DELETE_NEWS",

    //-- Training
    "READ_TRAINING",
    //  "CREATE_TRAINING",
    "UPDATE_TRAINING",

    // -- Courses
    "READ_COURSES",
    "CREATE_COURSES",
    "UPDATE_COURSES",

    //-- Infor Training
    "READ_INFORTRAINING",
    "CREATE_INFORTRAINING",
    "UPDATE_INFORTRAINING",

    //-- Logs
    "READ_LOGS",

    //-- Lop hoc
    "READ_CLASSALL",
    "CREATE_CLASSALL",
    "UPDATE_CLASSALL",
    "IMPORT_CLASSALL",
    "EXPORT_CLASSALL",
    "EDIT_SCORE_STUDENT",
    "SEND_NOTI_CLASS",
    "CLOSE_CLASS",

    //-- Danh sách học viên
    "READ_STUDENT",
    "CREATE_STUDENT",
    "UPDATE_STUDENT",
    "INVOICE_STUDENT",

    // -- điểm tích lũy
    "READ_SCORE_CUMULATIVE",

    // -- thống kê
    "READ_STATISTIC",
    "EXPORT_STATISTIC",

    //-- chứng chỉ
    "READ_DIPLOMA",

    // -- Thông báo
    "READ_NOTI",

    // -- Pay
    "READ_PAY",
    "UPDATE_PAY",
  ],
};

Admin.countDocuments(async (err, cnt) => {
  if (cnt < 1) {
    let role = await AdminRole.findOne({ key: "master" });
    if (!role) role = await new AdminRole(roleDefault).save();
    _.each(admin, (item) => {
      let data = _extend({}, item);
      Admin.init().then(() => {
        const admin = new Admin({
          ...data,
          permissionGroup: role._id,
        });
        const err = admin.validateSync();
        if (!err) {
          admin.save().then((data) => null);
        }
      });
    });
  }
});
