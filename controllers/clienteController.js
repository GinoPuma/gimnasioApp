const express = require('express');
const router = express.Router();

// Aquí importa cualquier middleware que vayas a usar en las rutas
const { verificarCliente } = require('../middlewares/verificarCliente');  // Middleware de ejemplo

// Ruta para obtener los datos de un cliente
router.get('/ver', verificarCliente, (req, res) => {
    try {
        // Lógica para obtener los datos del cliente
        res.json({ mensaje: 'Datos del cliente obtenidos correctamente' });
    } catch (error) {
        console.error('Error al obtener los datos del cliente:', error);
        res.status(500).json({ error: 'Error del servidor al obtener los datos' });
    }
});

// Ruta para actualizar los datos de un cliente
router.put('/actualizar', verificarCliente, (req, res) => {
    try {
        // Lógica para actualizar los datos del cliente
        res.json({ mensaje: 'Datos del cliente actualizados correctamente' });
    } catch (error) {
        console.error('Error al actualizar los datos del cliente:', error);
        res.status(500).json({ error: 'Error del servidor al actualizar los datos' });
    }
});

module.exports = router;
