// src/routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

router.post('/', userController.createUser);
router.post('/login', userController.loginUser);

module.exports = router;
