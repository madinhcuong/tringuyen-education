const express = require("express");
const router = express.Router();

const { authorizedAdminByPermission } = require("../../helpers/_base_helpers");
const _class = require("../../controllers/cms/class.controller");
const Class_controller = new _class();

router.get(
  "/get-list-class",
  authorizedAdminByPermission("READ_CLASSALL"),
  (req, res) => {
    Class_controller.GetListClass(req, res);
  }
);

router.get(
  "/get-classAll-by-id/:id",
  authorizedAdminByPermission("READ_CLASSALL"),
  (req, res) => {
    Class_controller.GetByIdClassAll(req, res);
  }
);

router.get("/get-class-byid-teacher-noPremission/:id", (req, res) => {
  Class_controller.GetClassByIdTeacher(req, res);
});

router.get("/list-class-noPremission", (req, res) => {
  Class_controller.ListClassNoPermission(req, res);
});

router.get(
  "/get-list-student-by-id-class/:id",
  authorizedAdminByPermission("READ_CLASSALL"),
  (req, res) => {
    Class_controller.GetListStudentByIdClass(req, res);
  }
);

router.get(
  "/get-statistic-classAll",
  authorizedAdminByPermission("READ_CLASSALL"),
  (req, res) => {
    Class_controller.StatisticClassAll(req, res);
  }
);

router.get(
  "/get-statistic-by-id-class",
  authorizedAdminByPermission("READ_CLASSALL"),
  (req, res) => {
    Class_controller.StatisticClassByID(req, res);
  }
);

router.post(
  "/create-class",
  authorizedAdminByPermission("CREATE_CLASSALL"),
  (req, res) => {
    Class_controller.CreateClass(req, res);
  }
);

router.put(
  "/edit-status-class-all/:id",
  authorizedAdminByPermission("UPDATE_CLASSALL"),
  (req, res) => {
    Class_controller.UpdateStatusClassAll(req, res);
  }
);

router.put(
  "/update-class-all/:id",
  authorizedAdminByPermission("UPDATE_CLASSALL"),
  (req, res) => {
    Class_controller.UpdateClassAll(req, res);
  }
);

router.put(
  "/update-teacher-class/:id",
  authorizedAdminByPermission("UPDATE_CLASSALL"),
  (req, res) => {
    Class_controller.UpdateTeacherClass(req, res);
  }
);

router.post(
  "/import-score-student/:id_class",
  authorizedAdminByPermission("IMPORT_CLASSALL"),
  (req, res) => {
    Class_controller.ImportScoreStudent(req, res);
  }
);

router.put(
  "/update-score-student/:id_student/:id_class",
  authorizedAdminByPermission("EDIT_SCORE_STUDENT"),
  (req, res) => {
    Class_controller.EditScoreStudent(req, res);
  }
);

router.post(
  "/send-noti-class",
  authorizedAdminByPermission("SEND_NOTI_CLASS"),
  (req, res) => {
    Class_controller.SendNotiClass(req, res);
  }
);

router.get(
  "/get-infor-student-class/:id_class/:id_student",
  authorizedAdminByPermission("READ_CLASSALL"),
  (req, res) => {
    Class_controller.InforStudentClass(req, res);
  }
);

router.put(
  "/close-class-by-id/:id",
  authorizedAdminByPermission("CLOSE_CLASS"),
  (req, res) => {
    Class_controller.CloseClassByid(req, res);
  }
);

// tạo qr code
router.get(
  "/get-qr-code",
  authorizedAdminByPermission("READ_CLASSALL"),
  (req, res) => {
    Class_controller.GetQrCode(req, res);
  }
);

module.exports = router;

//-- Lop hoc
//   "READ_CLASSALL",
//   "CREATE_CLASSALL",
//   "UPDATE_CLASSALL",
//   EDIT_SCORE
