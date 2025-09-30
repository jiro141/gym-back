const express = require("express");
const router = express.Router();
const { generateRoutinePdf } = require("../controllers/rutinaController");

router.post("/", generateRoutinePdf);

module.exports = router;
