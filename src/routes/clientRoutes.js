// src/routes/clientRoutes.js
const express = require('express');
const clientController = require('../controllers/clientController');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

// Rutas más específicas primero
router.post('/', authenticateToken, clientController.createClient);
router.get('/search', authenticateToken, clientController.searchClients);  // Primero /search
router.get('/', authenticateToken, clientController.getAllClients);         // Luego la general /
router.put('/:id', authenticateToken, clientController.updateClient);       // Ruta para actualizar cliente
router.get('/:id', authenticateToken, clientController.getClient);          // Ruta para obtener cliente por ID
router.put('/renew/:id', authenticateToken, clientController.renewMembership);  // Usar PUT para renovación
router.delete('/:id', authenticateToken, clientController.deleteClient);    // Ruta para eliminar cliente

module.exports = router;
