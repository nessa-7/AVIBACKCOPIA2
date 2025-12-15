const AdminController = require('../controllers/AdminController');
const express = require('express');
const router = express.Router();

router.get("/admins", AdminController.getAdmin);
router.delete("/admins/:id", AdminController.deleteAdmin);
router.patch("/admins/:id", AdminController.actualizarAdmin);

module.exports = router;
