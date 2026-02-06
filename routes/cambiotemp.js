const express = require('express');
const router = express.Router();
const ProgramasController = require('../controllers/ProgramasController');

router.get('/programas', ProgramasController.getProgramas);

module.exports = router;
