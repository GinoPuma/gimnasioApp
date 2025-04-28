const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuarioController');  
const { verificarCliente } = require('../middlewares/verificarClienteMiddlewars');
const { verificarEntrenador } = require('../middlewares/verificarEntrenadorMiddleware');

router.post('/registrar', UsuarioController.crearUsuario)

module.exports = router;
