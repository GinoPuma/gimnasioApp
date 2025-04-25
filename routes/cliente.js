const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { verificarToken } = require('../middlewares/userMiddleware');

router.get('/:usuarioId', clienteController.obtenerCliente);
router.get('/', clienteController.obtenerClientes)
router.post('/', clienteController.crearCliente);

module.exports = router;
