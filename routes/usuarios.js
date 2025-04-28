const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuarioController');  
const { verificarCliente } = require('../middlewares/verificarClienteMiddlewars');
const { verificarEntrenador } = require('../middlewares/verificarEntrenadorMiddleware');

// Ruta para registrar un usuario
router.post('/registrar', UsuarioController.crearUsuario);

module.exports = router;
