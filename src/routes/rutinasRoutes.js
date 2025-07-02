const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const rutinaController = require("../controllers/rutinaController")
const router = express.Router();

router.post('/rutinas', authenticateToken, );
module.exports = router;