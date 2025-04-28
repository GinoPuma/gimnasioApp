const express = require('express');
const router = express.Router();
const { verificarCliente } = require('../middlewares/verificarClienteMiddlewars');
const clienteController = require('../controllers/clienteController');

// Ruta existente para obtener y actualizar el cliente
router.get('/ver', verificarCliente, clienteController.obtenerCliente);
router.put('/actualizar', verificarCliente, clienteController.actualizarCliente);

// Ruta para acceder a la página de ejercicios (sin id ni parámetros adicionales)
router.get('/ejercicios', verificarCliente, (req, res) => {
    res.render('ejercicios');  // Renderiza la vista 'ejercicios.ejs'
});

// Ruta para acceder a la página de ejercicios (sin id ni parámetros adicionales)
router.get('/mientrenador', verificarCliente, (req, res) => {
    res.render('mientrenador');  // Renderiza la vista 'ejercicios.ejs'
});
// Ruta para acceder a la página de ejercicios (sin id ni parámetros adicionales)
router.get('/dietas', verificarCliente, (req, res) => {
    res.render('dietas');  // Renderiza la vista 'ejercicios.ejs'
});

module.exports = router;
