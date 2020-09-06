module.exports = {
  url_backend: "http://localhost:9000",

  permissionsDefault: [
    {
      label: "Quản lý nhân viên",
      value: "admin",
      permissions: [
        {
          label: "Xem danh sách nhân viên",
          value: "READ_ADMIN",
        },
        {
          label: "Tạo nhân viên",
          value: "CREATE_ADMIN",
        },
        {
          label: "Sửa nhân viên",
          value: "UPDATE_ADMIN",
        },
      ],
    },
    {
      label: "Quản lý phân quyền",
      value: "adminrole",
      permissions: [
        {
          label: "Xem quyền",
          value: "READ_ADMINROLE",
        },
        {
          label: "Tạo quyền",
          value: "CREATE_ADMINROLE",
        },
        {
          label: "Sửa quyền",
          value: "UPDATE_ADMINROLE",
        },
      ],
    },
    {
      label: "Quản lý giáo viên",
      value: "teacher",
      permissions: [
        {
          label: "Xem giáo viên",
          value: "READ_TEACHER",
        },
        {
          label: "Tạo mới giáo viên",
          value: "CREATE_TEACHER",
        },
        {
          label: "Sửa giáo viên",
          value: "UPDATE_TEACHER",
        },
      ],
    },
    {
      label: "Quản lý chủ đề tin tức",
      value: "topic",
      permissions: [
        {
          label: "Xem chủ đề",
          value: "READ_TOPIC",
        },
        {
          label: "Tạo chủ đề",
          value: "CREATE_TOPIC",
        },
        {
          label: "Sửa chủ đề",
          value: "UPDATE_TOPIC",
        },
        {
          label: "Xóa chủ đề",
          value: "DELETE_TOPIC",
        },
      ],
    },
    {
      label: "Quản lý Tin tức",
      value: "news",
      permissions: [
        {
          label: "Xem tin tức",
          value: "READ_NEWS",
        },
        {
          label: "Tạo tin tức",
          value: "CREATE_NEWS",
        },
        {
          label: "Sửa tin tức",
          value: "UPDATE_NEWS",
        },
        {
          label: "Xóa tin tức",
          value: "DELETE_NEWS",
        },
      ],
    },
    {
      label: "Đào tạo",
      value: "Training",
      permissions: [
        {
          label: "Xem hệ đào tạo",
          value: "READ_TRAINING",
        },
        // {
        //   label: "Tạo hệ đào tạo",
        //   value: "CREATE_TRAINING"
        // },
        {
          label: "Sửa hệ đào tạo",
          value: "UPDATE_TRAINING",
        },
      ],
    },
    {
      label: "Khóa học",
      value: "courses",
      permissions: [
        {
          label: "Xem khóa học",
          value: "READ_COURSES",
        },
        {
          label: "Tạo khóa học",
          value: "CREATE_COURSES",
        },
        {
          label: "Sửa khóa học",
          value: "UPDATE_COURSES",
        },
      ],
    },
    {
      label: "Thông tin khóa học",
      value: "InforTraining",
      permissions: [
        {
          label: "Xem thông tin khóa học",
          value: "READ_INFORTRAINING",
        },
        {
          label: "Tạo thông tin khóa học",
          value: "CREATE_INFORTRAINING",
        },
        {
          label: "Sửa thông tin khóa học",
          value: "UPDATE_INFORTRAINING",
        },
      ],
    },
    {
      label: "Danh sách tất cả lớp học",
      value: "ClassAll",
      permissions: [
        {
          label: "Xem thông tin tất cả lớp học",
          value: "READ_CLASSALL",
        },
        {
          label: "Tạo lớp học",
          value: "CREATE_CLASSALL",
        },
        {
          label: "Sửa thông tin lớp học",
          value: "UPDATE_CLASSALL",
        },
        {
          label: "Import điểm học viên",
          value: "IMPORT_CLASSALL",
        },
        {
          label: "Export danh sách học viên",
          value: "EXPORT_CLASSALL",
        },
        {
          label: "Sửa điểm học viên",
          value: "EDIT_SCORE_STUDENT",
        },
        {
          label: "Gửi thông báo",
          value: "SEND_NOTI_CLASS",
        },
        {
          label: "Kết thúc lớp học",
          value: "CLOSE_CLASS",
        },
      ],
    },
    {
      label: "Học viên",
      value: "Student",
      permissions: [
        {
          label: "Xem học viên",
          value: "READ_STUDENT",
        },
        {
          label: "Thêm học viên",
          value: "CREATE_STUDENT",
        },
        {
          label: "Sửa học viên",
          value: "UPDATE_STUDENT",
        },
        {
          label: "In hóa đơn",
          value: "INVOICE_STUDENT",
        },
      ],
    },
    {
      label: "Điểm tích lũy",
      value: "Score",
      permissions: [
        {
          label: "Xem danh sách điểm",
          value: "READ_SCORE_CUMULATIVE",
        },
      ],
    },
    {
      label: "Thống kê",
      value: "Statistic",
      permissions: [
        {
          label: "Xem thống kê",
          value: "READ_STATISTIC",
        },
        {
          label: "Xuất báo cáo",
          value: "EXPORT_STATISTIC",
        },
      ],
    },
    {
      label: "Thanh toán tiền",
      value: "Pay",
      permissions: [
        {
          label: "Xem thanh toán tiền",
          value: "READ_PAY",
        },
        {
          label: "Chỉnh sửa thanh toán tiền",
          value: "UPDATE_PAY",
        },
      ],
    },
    {
      label: "Thông báo",
      value: "Noti",
      permissions: [
        {
          label: "Xem thông báo",
          value: "READ_NOTI",
        },
      ],
    },
    {
      label: "Chứng chỉ",
      value: "Diploma",
      permissions: [
        {
          label: "Xem chứng chỉ",
          value: "READ_DIPLOMA",
        },
      ],
    },
    {
      label: "Lịch sử",
      value: "Logs",
      permissions: [
        {
          label: "Xem lịch sử",
          value: "READ_LOGS",
        },
      ],
    },
  ],
};
