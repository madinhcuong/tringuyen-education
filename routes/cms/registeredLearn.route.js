const express = require("express");
const router = express.Router();

const { authorizedAdminByPermission } = require("../../helpers/_base_helpers");
const registeredLearn = require("../../controllers/cms/registeredLearn.controller");
const registeredLearn_controller = new registeredLearn();

router.get(
  "/get-list-student-register-learn",
  authorizedAdminByPermission("READ_STUDENT"),
  (req, res) => {
    registeredLearn_controller.GetListStudentsRegisterLear(req, res);
  }
);

router.get(
  "/get-student-register-by-id/:id",
  authorizedAdminByPermission("READ_STUDENT"),
  (req, res) => {
    registeredLearn_controller.GetStudentRegisterById(req, res);
  }
);

router.put(
  "/update-payment-status/:id",
  authorizedAdminByPermission("UPDATE_STUDENT"),
  (req, res) => {
    registeredLearn_controller.UpdatePaymentStatus(req, res);
  }
);

router.put(
  "/update-student-register/:id",
  authorizedAdminByPermission("UPDATE_STUDENT"),
  (req, res) => {
    registeredLearn_controller.UpdateStudentRegister(req, res);
  }
);

router.get("/get-infor-tuition/:id", (req, res) => {
  registeredLearn_controller.GetInforTuitionByIdClasse(req, res);
});

router.put(
  "/check-invoice/:id",
  authorizedAdminByPermission("INVOICE_STUDENT"),
  (req, res) => {
    registeredLearn_controller.UpdateCheckInvoice(req, res);
  }
);

router.get(
  "/statistic-regis",
  authorizedAdminByPermission("READ_STUDENT"),
  (req, res) => {
    registeredLearn_controller.StatisticRegis(req, res);
  }
);

router.get(
  "/statistic-regis-payment",
  authorizedAdminByPermission("READ_STUDENT"),
  (req, res) => {
    registeredLearn_controller.StatisticRegis_Payment(req, res);
  }
);

module.exports = router;

"READ_STUDENT", "CREATE_STUDENT", "UPDATE_STUDENT", "INVOICE_STUDENT";
