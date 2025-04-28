const express = require('express');
const router = express.Router();
const { verificarCliente } = require('../middlewares/verificarClienteMiddlewars')
const clienteController = require('../controllers/clienteController')

router.get('/ver', verificarCliente, clienteController.obtenerCliente)
router.put('/actualizar', verificarCliente, clienteController.actualizarCliente)

module.exports = router;
