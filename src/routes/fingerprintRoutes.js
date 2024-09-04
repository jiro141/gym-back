const express = require('express');
const router = express.Router();
const { captureFingerprint } = require('../controllers/fingerprintController'); // o fingerprintController

// Ruta para capturar huella
router.post('/capture-fingerprint', captureFingerprint);

module.exports = router;
