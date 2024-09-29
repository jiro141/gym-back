// src/routes/attendanceRoutes.js
const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

router.put('/:idNumber', authenticateToken, attendanceController.markAttendance);

module.exports = router;
