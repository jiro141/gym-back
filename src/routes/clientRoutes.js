// src/routes/clientRoutes.js
const express = require('express');
const clientController = require('../controllers/clientController');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

// Ordenar las rutas de manera que las rutas más específicas vengan primero
router.post('/', authenticateToken, clientController.createClient);
router.get('/search', authenticateToken, clientController.searchClients); // Mover esta línea antes de :id
router.put('/:id', authenticateToken, clientController.updateClient);
router.get('/:id', authenticateToken, clientController.getClient);
router.get('/', authenticateToken, clientController.getAllClients);
router.delete('/:id', authenticateToken, clientController.deleteClient);

module.exports = router;
