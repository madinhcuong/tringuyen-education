const express = require('express');
const router = express.Router();
const Admin = require('../../controllers/cms/admin.controller');
const Admin_controller = new Admin();

router.post('/login', (req, res) => {
    Admin_controller.LoginAdmin(req, res);
})

module.exports = router;
