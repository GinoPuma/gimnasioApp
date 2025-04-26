const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// Ruta para mostrar el dashboard del cliente
router.get('/dashboard/:id', clienteController.mostrarDashboard);

// (Opcionales) otras rutas si las necesitas
// router.get('/:usuarioId', clienteController.obtenerCliente);
// router.get('/', clienteController.obtenerClientes);
// router.post('/', clienteController.crearCliente);

module.exports = router;
